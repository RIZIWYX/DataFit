package com.datafit.backend.abonnement;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Supplier;

// L'abonnement premium d'un compte (page Premium), payé via Stripe.
//   GET  /api/abonnement/{utilisateurId}           -> l'abonnement, ou 204 si formule gratuite
//   POST /api/abonnement/{utilisateurId}/paiement  -> { periodicite } ; renvoie { url } de la page de paiement Stripe
//   POST /api/abonnement/{utilisateurId}/portail   -> renvoie { url } du portail Stripe (gérer, résilier, réactiver)
// L'abonnement lui-même n'est jamais créé ici : c'est le webhook Stripe qui le fait (StripeWebhookController).
@RestController
@RequestMapping("/api/abonnement")
public class AbonnementController {

    private final AbonnementService abonnementService;

    public AbonnementController(AbonnementService abonnementService) {
        this.abonnementService = abonnementService;
    }

    @GetMapping("/{utilisateurId}")
    public ResponseEntity<?> lire(@PathVariable Long utilisateurId) {
        return abonnementService.lire(utilisateurId)
            .<ResponseEntity<?>>map(a -> ResponseEntity.ok(AbonnementResponse.depuis(a)))
            .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/{utilisateurId}/paiement")
    public ResponseEntity<?> paiement(
            @PathVariable Long utilisateurId,
            @Valid @RequestBody AbonnementRequest request) {
        return redirection(() -> abonnementService.paiement(utilisateurId, request.periodicite()));
    }

    @PostMapping("/{utilisateurId}/portail")
    public ResponseEntity<?> portail(@PathVariable Long utilisateurId) {
        return redirection(() -> abonnementService.portail(utilisateurId));
    }

    // renvoie { url } vers Stripe, ou { error } avec le bon code
    private ResponseEntity<?> redirection(Supplier<String> action) {
        try {
            return ResponseEntity.ok(Map.of("url", action.get()));
        } catch (NoSuchElementException e) {
            return erreur(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (IllegalStateException e) {
            return erreur(HttpStatus.CONFLICT, e.getMessage());
        } catch (PaiementIndisponibleException e) {
            return erreur(HttpStatus.SERVICE_UNAVAILABLE, e.getMessage());
        }
    }

    private static ResponseEntity<Map<String, String>> erreur(HttpStatus statut, String message) {
        return ResponseEntity.status(statut).body(Map.of("error", message));
    }
}
