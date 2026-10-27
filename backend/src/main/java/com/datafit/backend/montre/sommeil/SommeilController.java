package com.datafit.backend.montre.sommeil;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

// Une nuit = une ligne (voir Sommeil). Utilisateur ou nuit inconnus → 404, données invalides → 400,
// nuit déjà enregistrée ou renvoyée invalide par l'analyse → 409.
@RestController
@RequestMapping("/api/sommeil")
public class SommeilController {
    private final SommeilService service;
    private final UtilisateurRepository utilisateurRepo;

    public SommeilController(SommeilService service,
            UtilisateurRepository utilisateurRepo) {
        this.service = service;
        this.utilisateurRepo = utilisateurRepo;
    }

    // Analyse une nuit (simulateur puis analyse) et l'enregistre : renvoie la ligne
    // créée, avec son id (pour pouvoir la supprimer ensuite)
    @PostMapping("/{utilisateurId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Sommeil ajouter(@PathVariable Long utilisateurId) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
        return service.valider(user);
    }

    // Une nuit retirée de l'historique
    @DeleteMapping("/{utilisateurId}/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long utilisateurId, @PathVariable Long id) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
        service.supprimer(user, id);
        return ResponseEntity.noContent().build();
    }

    // La nuit terminée ce jour-là, ex. /api/sommeil/3/jour/2026-10-21 (réveil le
    // 21)
    @GetMapping("/{utilisateurId}/jour/{date}")
    public Sommeil duJour(@PathVariable Long utilisateurId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
        return service.duJour(user, date)
                .orElseThrow(() -> new NoSuchElementException("Aucune nuit enregistrée pour ce jour"));
    }

    // Historique pour un graphique (de la nuit la plus récente à la plus ancienne)
    @GetMapping("/{utilisateurId}")
    public List<Sommeil> historique(@PathVariable Long utilisateurId) {
        Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
        return service.historique(user);
    }
}
