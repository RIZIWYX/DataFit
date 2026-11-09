package com.datafit.backend.abonnement;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Supplier;

// L'abonnement premium d'un compte (page Premium). Démonstration : aucun paiement réel.
//   GET  /api/abonnement/{utilisateurId}              -> l'abonnement, ou 204 si formule gratuite
//   POST /api/abonnement/{utilisateurId}              -> { periodicite } ; souscrit (409 si déjà abonné)
//   POST /api/abonnement/{utilisateurId}/resilier     -> plus de renouvellement, accès jusqu'à la fin de période
//   POST /api/abonnement/{utilisateurId}/reactiver    -> annule la résiliation tant que la période court
//   PUT  /api/abonnement/{utilisateurId}/periodicite  -> { periodicite } ; s'applique au prochain renouvellement
// Le contrôleur ne fait que traduire HTTP <-> service : les règles sont dans AbonnementService.
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

    @PostMapping("/{utilisateurId}")
    public ResponseEntity<?> souscrire(
            @PathVariable Long utilisateurId,
            @Valid @RequestBody AbonnementRequest request) {
        return repondre(HttpStatus.CREATED, () -> abonnementService.souscrire(utilisateurId, request.periodicite()));
    }

    @PostMapping("/{utilisateurId}/resilier")
    public ResponseEntity<?> resilier(@PathVariable Long utilisateurId) {
        return repondre(HttpStatus.OK, () -> abonnementService.resilier(utilisateurId));
    }

    @PostMapping("/{utilisateurId}/reactiver")
    public ResponseEntity<?> reactiver(@PathVariable Long utilisateurId) {
        return repondre(HttpStatus.OK, () -> abonnementService.reactiver(utilisateurId));
    }

    @PutMapping("/{utilisateurId}/periodicite")
    public ResponseEntity<?> changerPeriodicite(
            @PathVariable Long utilisateurId,
            @Valid @RequestBody AbonnementRequest request) {
        return repondre(HttpStatus.OK, () -> abonnementService.changerPeriodicite(utilisateurId, request.periodicite()));
    }

    // exécute l'action du service et renvoie l'abonnement, ou { error } avec le bon code
    private ResponseEntity<?> repondre(HttpStatus succes, Supplier<Abonnement> action) {
        try {
            return ResponseEntity.status(succes).body(AbonnementResponse.depuis(action.get()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }
}
