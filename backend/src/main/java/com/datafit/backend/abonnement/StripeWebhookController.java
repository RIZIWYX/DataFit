package com.datafit.backend.abonnement;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Événements envoyés par Stripe : POST /api/stripe/webhook
// Seule source de vérité pour l'abonnement : un paiement n'est pris en compte qu'ici,
// après vérification de la signature, jamais sur la seule parole du navigateur.
//   checkout.session.completed      -> paiement validé : l'abonnement est créé
//   customer.subscription.updated   -> renouvellement, résiliation, réactivation, changement de formule
//   customer.subscription.deleted   -> abonnement terminé : retour en formule gratuite
@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    private static final Logger journal = LoggerFactory.getLogger(StripeWebhookController.class);

    private final StripeService stripeService;
    private final AbonnementService abonnementService;

    public StripeWebhookController(StripeService stripeService, AbonnementService abonnementService) {
        this.stripeService = stripeService;
        this.abonnementService = abonnementService;
    }

    // le corps doit rester brut (String) : la signature est calculée sur les octets exacts envoyés par Stripe
    @PostMapping("/webhook")
    public ResponseEntity<String> recevoir(
            @RequestBody String corps,
            @RequestHeader(name = "Stripe-Signature", required = false) String signature) {
        Event evenement;
        try {
            evenement = stripeService.lireEvenement(corps, signature);
        } catch (SignatureVerificationException | IllegalArgumentException e) {
            journal.warn("Webhook Stripe refusé : signature invalide");
            return ResponseEntity.badRequest().body("Signature invalide");
        } catch (PaiementIndisponibleException e) {
            return ResponseEntity.status(503).body(e.getMessage());
        }

        switch (evenement.getType()) {
            case "checkout.session.completed" -> {
                Session session = (Session) stripeService.objetDe(evenement);
                if (session.getSubscription() != null && session.getClientReferenceId() != null) {
                    abonnementService.paiementValide(
                        Long.valueOf(session.getClientReferenceId()),
                        stripeService.lireAbonnement(session.getSubscription()));
                }
            }
            case "customer.subscription.updated", "customer.subscription.deleted" -> {
                Subscription abonnement = (Subscription) stripeService.objetDe(evenement);
                // on relit l'abonnement : les événements peuvent arriver dans le désordre
                abonnementService.synchroniser(stripeService.lireAbonnement(abonnement.getId()));
            }
            default -> {
                // autres événements : rien à faire, mais on répond 200 pour que Stripe ne les renvoie pas
            }
        }
        return ResponseEntity.ok("ok");
    }
}
