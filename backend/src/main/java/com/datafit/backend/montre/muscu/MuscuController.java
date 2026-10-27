package com.datafit.backend.montre.muscu;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seances/muscu")
public class MuscuController {
  private final MuscuService service;
  private final UtilisateurRepository utilisateurRepo;

  public MuscuController(MuscuService service,
      UtilisateurRepository utilisateurRepo) {
    this.service = service;
    this.utilisateurRepo = utilisateurRepo;
  }

  // Enregistre une seance
  @PostMapping("/{utilisateurId}")
  public Muscu valider(@PathVariable Long utilisateurId,
      @Valid @RequestBody MuscuRequest req) {
    Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
    return service.valider(user, req);
  }

  // Historique pour un graphique
  @GetMapping("/{utilisateurId}")
  public List<Muscu> historique(@PathVariable Long utilisateurId) {
    Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
    return service.historique(user);
  }

  // Derniere seance
  @GetMapping("/{utilisateurId}/dernier")
  public ResponseEntity<Muscu> dernier(@PathVariable Long utilisateurId) {
    Utilisateur user = utilisateurRepo.findById(utilisateurId).orElseThrow();
    return service.derniere(user)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.noContent().build());
  }
}
