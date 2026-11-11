package com.datafit.backend.abonnement;

import java.time.LocalDateTime;

// Ce qui nous intéresse dans un abonnement Stripe, déjà traduit pour DataFit
public record EtatStripe(
    String subscriptionId,
    String customerId,
    String periodicite, // "mensuel" ou "annuel", déduit du prix choisi
    LocalDateTime finDePeriode,
    boolean resilie, // résiliation demandée : pas de renouvellement à la fin de la période
    boolean actif // faux quand Stripe a mis fin à l'abonnement (ou n'a jamais été payé)
) {}
