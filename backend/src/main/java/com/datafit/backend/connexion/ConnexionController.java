package com.datafit.backend.connexion;

import com.datafit.backend.utilisateur.Utilisateur;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Même début d'adresse que l'inscription : /api/auth/register et /api/auth/login
@RestController
@RequestMapping("/api/auth")
public class ConnexionController {

    private final ConnexionService connexionService;

    public ConnexionController(ConnexionService connexionService) {
        this.connexionService = connexionService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> seConnecter(
            @Valid @RequestBody ConnexionRequest request) {

        try {
            Utilisateur utilisateur = connexionService.seConnecter(request);

            // 200 OK : rien n'est créé, contrairement à l'inscription (201)
            return ResponseEntity.ok(
                Map.of(
                    "message", "Connexion réussie",
                    "id", utilisateur.getId(),
                    "email", utilisateur.getEmail()
                )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        }
    }
}
