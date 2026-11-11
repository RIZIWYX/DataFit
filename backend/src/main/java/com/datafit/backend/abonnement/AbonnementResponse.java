package com.datafit.backend.abonnement;

import java.time.LocalDateTime;

// Ce que l'API renvoie : l'abonnement sans l'entité JPA ni les identifiants Stripe
public record AbonnementResponse(
    String formule,
    String periodicite,
    LocalDateTime debut,
    LocalDateTime renouvellement,
    boolean resilie
) {
    public static AbonnementResponse depuis(Abonnement abonnement) {
        return new AbonnementResponse(
            abonnement.getFormule(),
            abonnement.getPeriodicite(),
            abonnement.getDebut(),
            abonnement.getRenouvellement(),
            abonnement.isResilie()
        );
    }
}
