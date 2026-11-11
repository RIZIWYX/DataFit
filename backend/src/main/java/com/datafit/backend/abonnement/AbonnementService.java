package com.datafit.backend.abonnement;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

// Règles de l'abonnement premium. Le paiement passe par Stripe : la page Premium ne fait que
// demander une page de paiement, et c'est le webhook (événements signés par Stripe) qui crée,
// met à jour ou supprime l'abonnement en base.
@Service
public class AbonnementService {

    private final AbonnementRepository abonnementRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final StripeService stripeService;

    public AbonnementService(
            AbonnementRepository abonnementRepository,
            UtilisateurRepository utilisateurRepository,
            StripeService stripeService) {
        this.abonnementRepository = abonnementRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.stripeService = stripeService;
    }

    // l'abonnement en cours, vide pour la formule gratuite
    @Transactional
    public Optional<Abonnement> lire(Long utilisateurId) {
        return aJour(utilisateurId, LocalDateTime.now());
    }

    // adresse de la page de paiement Stripe pour s'abonner
    @Transactional
    public String paiement(Long utilisateurId, String periodicite) {
        Utilisateur utilisateur = utilisateurRepository
            .findById(utilisateurId)
            .orElseThrow(() -> new NoSuchElementException("Ce compte n'existe pas"));

        if (aJour(utilisateurId, LocalDateTime.now()).isPresent()) {
            throw new IllegalStateException("Ce compte est déjà abonné");
        }
        return stripeService.creerPagePaiement(utilisateurId, utilisateur.getEmail(), periodicite);
    }

    // adresse du portail Stripe pour gérer ou résilier l'abonnement
    @Transactional
    public String portail(Long utilisateurId) {
        Abonnement abonnement = aJour(utilisateurId, LocalDateTime.now())
            .orElseThrow(() -> new NoSuchElementException("Aucun abonnement en cours"));
        return stripeService.creerPortail(abonnement.getStripeCustomerId());
    }

    // Paiement validé (événement checkout.session.completed) : crée ou met à jour l'abonnement du compte
    @Transactional
    public void paiementValide(Long utilisateurId, EtatStripe etat) {
        Utilisateur utilisateur = utilisateurRepository
            .findById(utilisateurId)
            .orElseThrow(() -> new NoSuchElementException("Compte introuvable : " + utilisateurId));

        // le même événement peut arriver deux fois : on met à jour au lieu de recréer
        abonnementRepository.findById(utilisateurId).ifPresentOrElse(
            abonnement -> abonnement.synchroniser(etat),
            () -> abonnementRepository.save(new Abonnement(
                utilisateur, etat.customerId(), etat.subscriptionId(), LocalDateTime.now(), etat))
        );
    }

    // Abonnement modifié ou terminé chez Stripe (renouvellement, résiliation, réactivation, changement de formule)
    @Transactional
    public void synchroniser(EtatStripe etat) {
        abonnementRepository.findByStripeSubscriptionId(etat.subscriptionId()).ifPresent(abonnement -> {
            if (etat.actif()) {
                abonnement.synchroniser(etat);
            } else {
                abonnementRepository.delete(abonnement);
            }
        });
    }

    // Filet de sécurité si un événement de fin n'est jamais arrivé :
    // période finie et résilié -> l'abonnement est supprimé (retour en gratuit).
    // Le renouvellement, lui, n'est jamais simulé : seul Stripe le confirme.
    Optional<Abonnement> aJour(Long utilisateurId, LocalDateTime maintenant) {
        Optional<Abonnement> trouve = abonnementRepository.findById(utilisateurId);
        if (trouve.isPresent() && trouve.get().isResilie() && trouve.get().estEchu(maintenant)) {
            abonnementRepository.delete(trouve.get());
            return Optional.empty();
        }
        return trouve;
    }
}
