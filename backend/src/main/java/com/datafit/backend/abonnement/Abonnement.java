package com.datafit.backend.abonnement;

import com.datafit.backend.utilisateur.Utilisateur;
import jakarta.persistence.*;

import java.time.LocalDateTime;

// Une ligne de la table "abonnement" (voir db/10_abonnement.sql) : l'abonnement premium d'un compte.
// Pas de ligne = formule gratuite. Créée et mise à jour uniquement à partir des événements Stripe.
@Entity
@Table(name = "abonnement")
public class Abonnement {

    // la clé de l'abonnement est celle de son utilisateur : un compte a au plus un abonnement
    @Id
    private Long utilisateurId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    @Column(name = "formule", nullable = false, length = 20)
    private String formule = "premium";

    // "mensuel" ou "annuel"
    @Column(name = "periodicite", nullable = false, length = 10)
    private String periodicite;

    @Column(name = "debut", nullable = false, updatable = false)
    private LocalDateTime debut;

    // fin de la période payée
    @Column(name = "renouvellement", nullable = false)
    private LocalDateTime renouvellement;

    // vrai : plus de renouvellement, l'accès reste actif jusqu'à la date ci-dessus
    @Column(name = "resilie", nullable = false)
    private boolean resilie;

    @Column(name = "stripe_customer_id")
    private String stripeCustomerId;

    @Column(name = "stripe_subscription_id", unique = true)
    private String stripeSubscriptionId;

    protected Abonnement() {
        // Constructeur par défaut requis par JPA
    }

    public Abonnement(Utilisateur utilisateur, String stripeCustomerId, String stripeSubscriptionId,
            LocalDateTime debut, EtatStripe etat) {
        this.utilisateur = utilisateur;
        this.stripeCustomerId = stripeCustomerId;
        this.stripeSubscriptionId = stripeSubscriptionId;
        this.debut = debut;
        synchroniser(etat);
    }

    // recopie ce que Stripe dit de l'abonnement (périodicité, fin de période, résiliation)
    public void synchroniser(EtatStripe etat) {
        this.periodicite = etat.periodicite();
        this.renouvellement = etat.finDePeriode();
        this.resilie = etat.resilie();
    }

    // la période payée est-elle terminée ?
    public boolean estEchu(LocalDateTime maintenant) {
        return !renouvellement.isAfter(maintenant);
    }

    public Long getUtilisateurId() {
        return utilisateurId;
    }

    public String getFormule() {
        return formule;
    }

    public String getPeriodicite() {
        return periodicite;
    }

    public LocalDateTime getDebut() {
        return debut;
    }

    public LocalDateTime getRenouvellement() {
        return renouvellement;
    }

    public boolean isResilie() {
        return resilie;
    }

    public String getStripeCustomerId() {
        return stripeCustomerId;
    }

    public String getStripeSubscriptionId() {
        return stripeSubscriptionId;
    }
}
