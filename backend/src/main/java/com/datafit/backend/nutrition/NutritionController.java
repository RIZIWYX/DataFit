package com.datafit.backend.nutrition;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

// Un repas = une ligne (voir Nutrition). Utilisateur inconnu → 404, données invalides → 400.
@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {
    private final NutritionService service;
    private final UtilisateurRepository utilisateurRepo;

    public NutritionController(NutritionService service,
            UtilisateurRepository utilisateurRepo) {
        this.service = service;
        this.utilisateurRepo = utilisateurRepo;
    }

    // Un repas noté : renvoie la ligne créée, avec son id (pour pouvoir la supprimer ensuite)
    @PostMapping("/{utilisateurId}")
    public Nutrition ajouter(@PathVariable Long utilisateurId,
            @Valid @RequestBody NutritionRequest req) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
        return service.ajouter(user, req);
    }

    // Un repas retiré du journal
    @DeleteMapping("/{utilisateurId}/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long utilisateurId, @PathVariable Long id) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
        service.supprimer(user, id);
        return ResponseEntity.noContent().build();
    }

    // Les repas d'un jour, ex. /api/nutrition/3/jour/2026-10-21
    @GetMapping("/{utilisateurId}/jour/{date}")
    public List<Nutrition> duJour(@PathVariable Long utilisateurId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
        return service.duJour(user, date);
    }

    // Historique pour un graphique (du plus récent au plus ancien)
    @GetMapping("/{utilisateurId}")
    public List<Nutrition> historique(@PathVariable Long utilisateurId) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
        return service.historique(user);
    }
}
