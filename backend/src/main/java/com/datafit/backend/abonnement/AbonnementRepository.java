package com.datafit.backend.abonnement;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {

    // les événements Stripe désignent l'abonnement par son identifiant Stripe (sub_...)
    Optional<Abonnement> findByStripeSubscriptionId(String stripeSubscriptionId);
}
