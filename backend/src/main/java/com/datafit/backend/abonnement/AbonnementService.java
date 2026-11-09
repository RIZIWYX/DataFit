package com.datafit.backend.abonnement;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

// Règles de l'abonnement premium. Les dates sont toujours calculées ici, jamais par le navigateur.
// Démonstration : la souscription ne passe par aucun paiement réel.
@Service
public class AbonnementService {

    private final AbonnementRepository abonnementRepository;
    private final UtilisateurRepository utilisateurRepository;

    public AbonnementService(
            AbonnementRepository abonnementRepository,
            UtilisateurRepository utilisateurRepository) {
        this.abonnementRepository = abonnementRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    // l'abonnement en cours, vide pour la formule gratuite
    @Transactional
    public Optional<Abonnement> lire(Long utilisateurId) {
        return aJour(utilisateurId, LocalDateTime.now());
    }

    @Transactional
    public Abonnement souscrire(Long utilisateurId, String periodicite) {
        LocalDateTime maintenant = LocalDateTime.now();
        Utilisateur utilisateur = utilisateurRepository
            .findById(utilisateurId)
            .orElseThrow(() -> new NoSuchElementException("Ce compte n'existe pas"));

        if (aJour(utilisateurId, maintenant).isPresent()) {
            throw new IllegalStateException("Ce compte est déjà abonné");
        }

        // ici, la version finale créera une session de paiement et attendra la confirmation du webhook
        return abonnementRepository.save(new Abonnement(utilisateur, periodicite, maintenant));
    }

    @Transactional
    public Abonnement resilier(Long utilisateurId) {
        Abonnement abonnement = enCours(utilisateurId);
        abonnement.resilier();
        return abonnement;
    }

    @Transactional
    public Abonnement reactiver(Long utilisateurId) {
        Abonnement abonnement = enCours(utilisateurId);
        abonnement.reactiver();
        return abonnement;
    }

    @Transactional
    public Abonnement changerPeriodicite(Long utilisateurId, String periodicite) {
        Abonnement abonnement = enCours(utilisateurId);
        abonnement.changerPeriodicite(periodicite);
        return abonnement;
    }

    private Abonnement enCours(Long utilisateurId) {
        return aJour(utilisateurId, LocalDateTime.now())
            .orElseThrow(() -> new NoSuchElementException("Aucun abonnement en cours"));
    }

    // Applique ce qui s'est passé depuis la dernière lecture :
    // période finie et résilié -> l'abonnement est supprimé (retour en gratuit) ;
    // période finie sinon -> renouvellement automatique.
    // Les modifications de l'entité sont enregistrées à la fin de la transaction.
    Optional<Abonnement> aJour(Long utilisateurId, LocalDateTime maintenant) {
        Optional<Abonnement> trouve = abonnementRepository.findById(utilisateurId);
        if (trouve.isEmpty() || !trouve.get().estEchu(maintenant)) return trouve;

        Abonnement abonnement = trouve.get();
        if (abonnement.isResilie()) {
            abonnementRepository.delete(abonnement);
            return Optional.empty();
        }
        abonnement.renouveler(maintenant);
        return Optional.of(abonnement);
    }
}
