package com.datafit.backend.sport.streetlifting;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/streetlifting")
public class StreetliftingController {
private final StreetliftingService service;
private final UtilisateurRepository utilisateurRepo;

public StreetliftingController(StreetliftingService service,
    UtilisateurRepository utilisateurRepo) {
  this.service = service;
  this.utilisateurRepo = utilisateurRepo;
}

// Récupère l'utilisateur ou lève une 404 (via ApiExceptionHandler)
private Utilisateur chargerUtilisateur(Long id) {
  return utilisateurRepo.findById(id)
      .orElseThrow(() -> new NoSuchElementException(
        "Utilisateur introuvable (id = " + id + ")."
        ));
}

// Bouton "Valider"
@PostMapping("/{utilisateurId}")
public Streetlifting valider(@PathVariable Long utilisateurId,
    @Valid @RequestBody StreetliftingRequest req) {
  return service.valider(chargerUtilisateur(utilisateurId), req);
}

// Bouton "Modifier"
@PutMapping("/{utilisateurId}/aujourdhui")
public Streetlifting modifier(@PathVariable Long utilisateurId,
    @Valid @RequestBody StreetliftingRequest req) {
  return service.modifierCelleDuJour(chargerUtilisateur(utilisateurId), req);
}

// Pour pré-remplir le formulaire
@GetMapping("/{utilisateurId}/dernier")
public ResponseEntity<Streetlifting> dernier(@PathVariable Long utilisateurId) {
  return service.dernierePerf(chargerUtilisateur(utilisateurId))
    .map(ResponseEntity::ok)
    .orElse(ResponseEntity.noContent().build());
}

// Pour savoir si on affiche "Valider" ou "Modifier"
@GetMapping("/{utilisateurId}/aujourdhui")
public ResponseEntity<Streetlifting> aujourdhui(@PathVariable Long utilisateurId) {
  return service.celleDuJour(chargerUtilisateur(utilisateurId))
    .map(ResponseEntity::ok)
    .orElse(ResponseEntity.noContent().build());
}

// Historique pour un graphique
@GetMapping("/{utilisateurId}")
public List<Streetlifting> historique(@PathVariable Long utilisateurId) {
  return service.historique(chargerUtilisateur(utilisateurId));
}
}
