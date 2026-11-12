package com.datafit.backend.compte;

import com.datafit.backend.abonnement.AbonnementRepository;
import com.datafit.backend.abonnement.StripeService;
import com.datafit.backend.montre.graphiques.ArchivesMesures;
import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.Set;

// Les données du compte (droit à l'effacement du RGPD) : suppression définitive du compte,
// ou effacement de certaines données en gardant le compte et le profil.
@Service
public class CompteService {

    // Tables liées au compte qu'« Effacer mes données » ne touche jamais : le profil (il reste,
    // c'est le principe) et l'abonnement (il se gère sur la page Premium). Toutes les autres
    // tables avec utilisateur_id sont rangées dans CategorieDonnees (vérifié par EffacementTablesTest).
    static final Set<String> TABLES_GARDEES = Set.of("profil", "abonnement");

    private final UtilisateurRepository utilisateurRepository;
    private final AbonnementRepository abonnementRepository;
    private final StripeService stripeService;
    private final ArchivesMesures archives;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbc;

    public CompteService(
            UtilisateurRepository utilisateurRepository,
            AbonnementRepository abonnementRepository,
            StripeService stripeService,
            ArchivesMesures archives,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbc) {
        this.utilisateurRepository = utilisateurRepository;
        this.abonnementRepository = abonnementRepository;
        this.stripeService = stripeService;
        this.archives = archives;
        this.passwordEncoder = passwordEncoder;
        this.jdbc = jdbc;
    }

    @Transactional
    public void supprimer(Long utilisateurId, String motDePasse) {
        Utilisateur utilisateur = verifierMotDePasse(utilisateurId, motDePasse);

        // 1. l'abonnement Premium est arrêté chez Stripe AVANT d'effacer le compte : sinon la carte
        //    continuerait d'être prélevée pour un compte qui n'existe plus. Si Stripe ne répond pas,
        //    l'exception annule tout et le compte reste en place.
        abonnementRepository.trouverIdStripe(utilisateurId)
            .filter(id -> !id.isBlank())
            .ifPresent(stripeService::arreterAbonnement);

        // 2. la base efface tout ce qui dépend du compte (profil, séances, nuits, repas, eau,
        //    performances, abonnement) : toutes ces tables sont en ON DELETE CASCADE
        utilisateurRepository.delete(utilisateur);

        // 3. les mesures de la montre, gardées en fichiers : effacées une fois la suppression
        //    validée en base (rien n'est effacé si elle échoue)
        archives.supprimerCompte(utilisateurId);
    }

    // « Effacer mes données » : les lignes de l'utilisateur dans les tables des catégories choisies,
    // puis les mesures de la montre correspondantes. Le compte, le profil et l'abonnement restent.
    // Tout se passe dans une seule transaction : si une table échoue, rien n'est effacé.
    @Transactional
    public void effacerDonnees(Long utilisateurId, String motDePasse, Set<CategorieDonnees> categories) {
        verifierMotDePasse(utilisateurId, motDePasse);

        for (CategorieDonnees categorie : categories) {
            for (String table : categorie.tables()) {
                // le nom de la table vient de CategorieDonnees, jamais de la requête : pas d'injection SQL
                jdbc.update("DELETE FROM " + table + " WHERE utilisateur_id = ?", utilisateurId);
            }
            // les fichiers partent une fois l'effacement validé en base (comme pour le compte)
            archives.supprimerMesures(utilisateurId, categorie.mesures());
        }
    }

    // L'API ne sait pas encore qui appelle (l'identifiant est dans l'adresse, voir docs/securite.md) :
    // le mot de passe est donc la seule preuve que c'est bien le propriétaire du compte.
    private Utilisateur verifierMotDePasse(Long utilisateurId, String motDePasse) {
        Utilisateur utilisateur = utilisateurRepository
            .findById(utilisateurId)
            .orElseThrow(() -> new NoSuchElementException("Ce compte n'existe pas"));

        // même vérification qu'à la connexion (ConnexionService) : matches() rechiffre le mot de
        // passe tapé avec le sel du haché enregistré
        if (!passwordEncoder.matches(motDePasse, utilisateur.getPasswordHash())) {
            throw new MotDePasseIncorrectException();
        }
        return utilisateur;
    }
}
