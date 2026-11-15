package com.datafit.backend.compte;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

// Consentement aux données de santé du compte connecté.
//   GET  /api/compte/{utilisateurId}/consentement-sante -> { accepteLe } (null tant qu'il n'est pas donné)
//   POST /api/compte/{utilisateurId}/consentement-sante -> enregistre le consentement, renvoie { accepteLe }
// Protégé comme toute l'API : seul le compte lui-même (AuthInterceptor) peut lire ou donner son consentement.
@RestController
@RequestMapping("/api/compte")
public class ConsentementSanteController {

    private final ConsentementSanteService service;

    public ConsentementSanteController(ConsentementSanteService service) {
        this.service = service;
    }

    @GetMapping("/{utilisateurId}/consentement-sante")
    public ResponseEntity<?> lire(@PathVariable Long utilisateurId) {
        try {
            return reponse(service.lire(utilisateurId).map(Object::toString).orElse(null));
        } catch (NoSuchElementException e) {
            return erreur(e);
        }
    }

    @PostMapping("/{utilisateurId}/consentement-sante")
    public ResponseEntity<?> accepter(@PathVariable Long utilisateurId) {
        try {
            return reponse(service.accepter(utilisateurId).toString());
        } catch (NoSuchElementException e) {
            return erreur(e);
        }
    }

    // { "accepteLe": "2026-11-15T10:30:00" } ou { "accepteLe": null } (Map.of refuse null)
    private static ResponseEntity<Map<String, Object>> reponse(String accepteLe) {
        Map<String, Object> corps = new HashMap<>();
        corps.put("accepteLe", accepteLe);
        return ResponseEntity.ok(corps);
    }

    private static ResponseEntity<Map<String, String>> erreur(NoSuchElementException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
    }
}
