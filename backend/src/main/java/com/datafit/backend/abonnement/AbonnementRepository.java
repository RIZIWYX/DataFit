package com.datafit.backend.abonnement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {

    // les événements Stripe désignent l'abonnement par son identifiant Stripe (sub_...)
    Optional<Abonnement> findByStripeSubscriptionId(String stripeSubscriptionId);

    // Seulement l'identifiant Stripe (sub_...) de l'abonnement d'un compte, vide s'il n'y en a pas.
    // Utilisé avant de supprimer le compte : on ne charge pas l'abonnement lui-même, sinon
    // Hibernate refuse ensuite d'effacer le compte auquel il est rattaché.
    @Query("SELECT a.stripeSubscriptionId FROM Abonnement a WHERE a.utilisateurId = :utilisateurId")
    Optional<String> trouverIdStripe(@Param("utilisateurId") Long utilisateurId);
}
