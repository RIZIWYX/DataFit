package com.datafit.backend.seance.cardio;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seances/cardio")
public class CardioController {
private final CardioService service;
private final UtilisateurRepository utilisateurRepo;

public CardioController(CardioService service,
    UtilisateurRepository utilisateurRepo) {
  this.service = service;
  this.utilisateurRepo = utilisateurRepo;
}

@PostMapping("/{utilisateurId}")
public Cardio valider(@PathVariable Long utilisateurId,
    @Valid @RequestBody CardioRequest req) {
  Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
  return service.valider(user, req);
}

@GetMapping("/{utilisateurId}")
public List<Cardio> historique(@PathVariable Long utilisateurId) {
  Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
  return service.historique(user);
}

@GetMapping("/{utilisateurId}/dernier")
public ResponseEntity<Cardio> dernier(@PathVariable Long utilisateurId) {
  Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
  return service.derniere(user)
    .map(ResponseEntity::ok)
    .orElse(ResponseEntity.noContent().build());
}
}
