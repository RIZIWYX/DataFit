package com.datafit.backend.hydratation;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

// L'eau bue, notée sur la page Nutrition.
//   GET    /api/hydratation/{utilisateurId}/{date}  -> les ajouts du jour [{ id, date, ml }]
//   POST   /api/hydratation/{utilisateurId}         -> { date, ml } ; renvoie { id, date, ml }
//   DELETE /api/hydratation/{utilisateurId}/{id}    -> retire un ajout
// Le contrôleur ne fait que traduire HTTP <-> service : les règles sont dans HydratationService.
@RestController
@RequestMapping("/api/hydratation")
public class HydratationController {

    private final HydratationService hydratationService;

    public HydratationController(HydratationService hydratationService) {
        this.hydratationService = hydratationService;
    }

    @GetMapping("/{utilisateurId}/{date}")
    public ResponseEntity<?> duJour(@PathVariable Long utilisateurId, @PathVariable String date) {
        LocalDate jour;
        try {
            jour = LocalDate.parse(date);
        } catch (DateTimeParseException e) {
            return erreur(HttpStatus.BAD_REQUEST, "Date invalide (format attendu : AAAA-MM-JJ).");
        }

        List<HydratationResponse> ajouts = hydratationService.duJour(utilisateurId, jour).stream()
            .map(HydratationResponse::depuis)
            .toList();
        return ResponseEntity.ok(ajouts);
    }

    @PostMapping("/{utilisateurId}")
    public ResponseEntity<?> ajouter(
            @PathVariable Long utilisateurId,
            @Valid @RequestBody HydratationRequest request) {
        try {
            Hydratation ajout = hydratationService.ajouter(utilisateurId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(HydratationResponse.depuis(ajout));
        } catch (NoSuchElementException e) {
            return erreur(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @DeleteMapping("/{utilisateurId}/{id}")
    public ResponseEntity<?> supprimer(@PathVariable Long utilisateurId, @PathVariable Long id) {
        try {
            hydratationService.supprimer(utilisateurId, id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return erreur(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    private static ResponseEntity<Map<String, String>> erreur(HttpStatus statut, String message) {
        return ResponseEntity.status(statut).body(Map.of("error", message));
    }
}