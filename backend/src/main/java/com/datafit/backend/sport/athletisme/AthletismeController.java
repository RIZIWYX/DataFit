package com.datafit.backend.sport.athletisme;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/athletisme")
public class AthletismeController {
private final AthletismeService service;
private final UtilisateurRepository utilisateurRepo;

public AthletismeController(AthletismeService service,
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
public Athletisme valider(@PathVariable Long utilisateurId,
    @Valid @RequestBody AthletismeRequest req) {
  return service.valider(chargerUtilisateur(utilisateurId), req);
}

// Bouton "Modifier"
@PutMapping("/{utilisateurId}/aujourdhui")
public Athletisme modifier(@PathVariable Long utilisateurId,
    @Valid @RequestBody AthletismeRequest req) {
  return service.modifierCelleDuJour(chargerUtilisateur(utilisateurId), req);
}

// Pour pré-remplir le formulaire
@GetMapping("/{utilisateurId}/dernier")
public ResponseEntity<Athletisme> dernier(@PathVariable Long utilisateurId) {
  return service.dernierePerf(chargerUtilisateur(utilisateurId))
    .map(ResponseEntity::ok)
    .orElse(ResponseEntity.noContent().build());
}

// Pour savoir si on affiche "Valider" ou "Modifier"
@GetMapping("/{utilisateurId}/aujourdhui")
public ResponseEntity<Athletisme> aujourdhui(@PathVariable Long utilisateurId) {
  return service.celleDuJour(chargerUtilisateur(utilisateurId))
    .map(ResponseEntity::ok)
    .orElse(ResponseEntity.noContent().build());
}

// Historique pour un graphique
@GetMapping("/{utilisateurId}")
public List<Athletisme> historique(@PathVariable Long utilisateurId) {
  return service.historique(chargerUtilisateur(utilisateurId));
}
}
