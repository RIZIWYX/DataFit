package com.datafit.backend.abonnement;

import com.datafit.backend.utilisateur.Utilisateur;
import jakarta.persistence.*;

import java.time.LocalDateTime;

// Une ligne de la table "abonnement" (voir db/10_abonnement.sql) : l'abonnement premium d'un compte.
// Pas de ligne = formule gratuite. Démonstration : aucun paiement réel.
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

    protected Abonnement() {
        // Constructeur par défaut requis par JPA
    }

    public Abonnement(Utilisateur utilisateur, String periodicite, LocalDateTime debut) {
        this.utilisateur = utilisateur;
        this.periodicite = periodicite;
        this.debut = debut;
        this.renouvellement = finDePeriode(debut, periodicite);
        this.resilie = false;
    }

    public static LocalDateTime finDePeriode(LocalDateTime depart, String periodicite) {
        return "annuel".equals(periodicite) ? depart.plusYears(1) : depart.plusMonths(1);
    }

    // la période payée est-elle terminée ?
    public boolean estEchu(LocalDateTime maintenant) {
        return !renouvellement.isAfter(maintenant);
    }

    // renouvellement automatique : avance la fin de période jusqu'après "maintenant"
    // (en vrai, chaque renouvellement sera confirmé par le webhook de paiement)
    public void renouveler(LocalDateTime maintenant) {
        while (estEchu(maintenant)) {
            renouvellement = finDePeriode(renouvellement, periodicite);
        }
    }

    public void resilier() {
        this.resilie = true;
    }

    public void reactiver() {
        this.resilie = false;
    }

    // la nouvelle périodicité s'applique au prochain renouvellement
    public void changerPeriodicite(String periodicite) {
        this.periodicite = periodicite;
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
}
