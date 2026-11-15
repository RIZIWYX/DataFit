package com.datafit.backend.inscription;

import com.datafit.backend.securite.SessionService;
import com.datafit.backend.utilisateur.Utilisateur;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SessionService sessions;

    public AuthController(AuthService authService, SessionService sessions) {
        this.authService = authService;
        this.sessions = sessions;
    }

    @PostMapping("/register")
    public ResponseEntity<?> inscrire(
            @Valid @RequestBody RegisterRequest request) {

        try {
            Utilisateur utilisateur = authService.inscrire(request);

            // le compte est utilisable tout de suite : on ouvre la session (cookie), sinon la
            // création du profil qui suit serait refusée
            String jeton = sessions.ouvrir(utilisateur.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, sessions.cookie(jeton).toString())
                .body(Map.of(
                    "message", "Inscription réussie",
                    "id", utilisateur.getId(),
                    "email", utilisateur.getEmail()
                ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        }
    }
}
