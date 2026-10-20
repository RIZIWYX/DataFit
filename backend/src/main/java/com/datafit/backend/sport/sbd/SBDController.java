package com.datafit.backend.sport.sbd;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sbd")
public class SBDController {
private final SBDService service;
private final UtilisateurRepository utilisateurRepo;

public SBDController(SBDService service,
    UtilisateurRepository utilisateurRepo) {
  this.service = service;
  this.utilisateurRepo = utilisateurRepo;
}

// Bouton "Valider"
@PostMapping("/{utilisateurId}")
public SBD valider(@PathVariable Long utilisateurId,
    @RequestBody SBDRequest req) {
  Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
  return service.valider(user, req);
}

// Bouton "Modifier"
@PutMapping("/{utilisateurId}/aujourdhui")
public SBD modifier(@PathVariable Long utilisateurId,
    @RequestBody SBDRequest req) {
  Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
  return service.modifierCelleDuJour(user, req);
}

// Pour pré-remplir le formulaire
@GetMapping("/{utilisateurId}/dernier")
public ResponseEntity<SBD> dernier(@PathVariable Long utilisateurId) {
  Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
  return service.dernierePerf(user)
    .map(ResponseEntity::ok)
    .orElse(ResponseEntity.noContent().build());
}

// Pour savoir si on affiche "Valider" ou "Modifier"
@GetMapping("/{utilisateurId}/aujourdhui")
public ResponseEntity<SBD> aujourdhui(@PathVariable Long utilisateurId) {
  Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
  return service.celleDuJour(user)
    .map(ResponseEntity::ok)
    .orElse(ResponseEntity.noContent().build());
}

// Historique pour un graphique
@GetMapping("/{utilisateurId}")
public List<SBD> historique(@PathVariable Long utilisateurId) {
  Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
  return service.historique(user);
}
}
