package com.datafit.backend.nutrition;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Mêmes routes que les disciplines (voir SBDController) : le front peut réutiliser services/sport/http.ts.
// Utilisateur inconnu → 404, déjà saisi aujourd'hui ou rien à modifier → 409 (voir ApiExceptionHandler).
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

    // Bouton "Valider"
    @PostMapping("/{utilisateurId}")
    public Nutrition valider(@PathVariable Long utilisateurId,
            @Valid @RequestBody NutritionRequest req) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
        return service.valider(user, req);
    }

    // Bouton "Modifier"
    @PutMapping("/{utilisateurId}/aujourdhui")
    public Nutrition modifier(@PathVariable Long utilisateurId,
            @Valid @RequestBody NutritionRequest req) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
        return service.modifierCelleDuJour(user, req);
    }

    // Pour pré-remplir le formulaire
    @GetMapping("/{utilisateurId}/dernier")
    public ResponseEntity<Nutrition> dernier(@PathVariable Long utilisateurId) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
        return service.derniereSaisie(user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // Pour savoir si on affiche "Valider" ou "Modifier"
    @GetMapping("/{utilisateurId}/aujourdhui")
    public ResponseEntity<Nutrition> aujourdhui(@PathVariable Long utilisateurId) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
        return service.celleDuJour(user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // Historique pour un graphique (du plus récent au plus ancien)
    @GetMapping("/{utilisateurId}")
    public List<Nutrition> historique(@PathVariable Long utilisateurId) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
        return service.historique(user);
    }
}
