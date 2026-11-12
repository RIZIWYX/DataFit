package com.datafit.backend.compte;

import com.datafit.backend.abonnement.AbonnementRepository;
import com.datafit.backend.abonnement.StripeService;
import com.datafit.backend.montre.graphiques.ArchivesMesures;
import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

// Suppression définitive d'un compte (droit à l'effacement du RGPD).
@Service
public class CompteService {

    private final UtilisateurRepository utilisateurRepository;
    private final AbonnementRepository abonnementRepository;
    private final StripeService stripeService;
    private final ArchivesMesures archives;
    private final PasswordEncoder passwordEncoder;

    public CompteService(
            UtilisateurRepository utilisateurRepository,
            AbonnementRepository abonnementRepository,
            StripeService stripeService,
            ArchivesMesures archives,
            PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.abonnementRepository = abonnementRepository;
        this.stripeService = stripeService;
        this.archives = archives;
        this.passwordEncoder = passwordEncoder;
    }

    // L'API ne sait pas encore qui appelle (l'identifiant est dans l'adresse, voir docs/securite.md) :
    // le mot de passe est donc la seule preuve que c'est bien le propriétaire du compte.
    @Transactional
    public void supprimer(Long utilisateurId, String motDePasse) {
        Utilisateur utilisateur = utilisateurRepository
            .findById(utilisateurId)
            .orElseThrow(() -> new NoSuchElementException("Ce compte n'existe pas"));

        // même vérification qu'à la connexion (ConnexionService) : matches() rechiffre le mot de
        // passe tapé avec le sel du haché enregistré
        if (!passwordEncoder.matches(motDePasse, utilisateur.getPasswordHash())) {
            throw new MotDePasseIncorrectException();
        }

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
}
