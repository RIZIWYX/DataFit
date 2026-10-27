package com.datafit.backend.montre.velo;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seances/velo")
public class VeloController {
private final VeloService service;
private final UtilisateurRepository utilisateurRepo;

public VeloController(VeloService service,
    UtilisateurRepository utilisateurRepo) {
  this.service = service;
  this.utilisateurRepo = utilisateurRepo;
}

@PostMapping("/{utilisateurId}")
public Velo valider(@PathVariable Long utilisateurId,
    @Valid @RequestBody VeloRequest req) {
  Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
  return service.valider(user, req);
}

@GetMapping("/{utilisateurId}")
public List<Velo> historique(@PathVariable Long utilisateurId) {
  Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
  return service.historique(user);
}

@GetMapping("/{utilisateurId}/dernier")
public ResponseEntity<Velo> dernier(@PathVariable Long utilisateurId) {
  Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
  return service.derniere(user)
    .map(ResponseEntity::ok)
    .orElse(ResponseEntity.noContent().build());
}
}
