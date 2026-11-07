
package com.datafit.backend.nutrition;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {

    private final NutritionService service;
    private final UtilisateurRepository utilisateurRepo;
    private final AnalyseNutritionService analyseService;

    public NutritionController(
            NutritionService service,
            UtilisateurRepository utilisateurRepo,
            AnalyseNutritionService analyseService) {
        this.service = service;
        this.utilisateurRepo = utilisateurRepo;
        this.analyseService = analyseService;
    }

    @PostMapping("/{utilisateurId}")
    public Nutrition ajouter(
            @PathVariable Long utilisateurId,
            @Valid @RequestBody NutritionRequest req) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        return service.ajouter(user, req);
    }

    @DeleteMapping("/{utilisateurId}/{id}")
    public ResponseEntity<Void> supprimer(
            @PathVariable Long utilisateurId,
            @PathVariable Long id) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        service.supprimer(user, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{utilisateurId}/jour/{date}")
    public List<Nutrition> duJour(
            @PathVariable Long utilisateurId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        return service.duJour(user, date);
    }

    @GetMapping("/{utilisateurId}")
    public List<Nutrition> historique(@PathVariable Long utilisateurId) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        return service.historique(user);
    }

    @PostMapping("/{utilisateurId}/analyser/{date}")
    public AnalyseNutrition analyserJour(
            @PathVariable Long utilisateurId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        try {
            return analyseService.analyserJour(user, date);
        } catch (IllegalArgumentException erreur) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, erreur.getMessage());
        }
    }
}
