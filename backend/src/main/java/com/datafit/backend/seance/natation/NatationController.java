package com.datafit.backend.seance.natation;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seances/natation")
public class NatationController {
private final NatationService service;
private final UtilisateurRepository utilisateurRepo;

public NatationController(NatationService service,
    UtilisateurRepository utilisateurRepo) {
  this.service = service;
  this.utilisateurRepo = utilisateurRepo;
}

@PostMapping("/{utilisateurId}")
public Natation valider(@PathVariable Long utilisateurId,
    @Valid @RequestBody NatationRequest req) {
  Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
  return service.valider(user, req);
}

@GetMapping("/{utilisateurId}")
public List<Natation> historique(@PathVariable Long utilisateurId) {
  Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
  return service.historique(user);
}

@GetMapping("/{utilisateurId}/dernier")
public ResponseEntity<Natation> dernier(@PathVariable Long utilisateurId) {
  Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
  return service.derniere(user)
    .map(ResponseEntity::ok)
    .orElse(ResponseEntity.noContent().build());
}
}
