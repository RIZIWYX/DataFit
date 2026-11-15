package com.datafit.backend.connexion;

import com.datafit.backend.securite.LimiteurTentatives;
import com.datafit.backend.securite.SessionService;
import com.datafit.backend.utilisateur.Utilisateur;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Locale;
import java.util.Map;

// Même début d'adresse que l'inscription : /api/auth/register et /api/auth/login
@RestController
@RequestMapping("/api/auth")
public class ConnexionController {

    // après 5 échecs sur la même adresse e-mail, on bloque 15 minutes : un mot de passe ne peut
    // plus être deviné en boucle (même en changeant d'adresse IP)
    private static final int ECHECS_MAX = 5;
    private static final Duration FENETRE = Duration.ofMinutes(15);

    private final ConnexionService connexionService;
    private final SessionService sessions;
    private final LimiteurTentatives limiteur;

    public ConnexionController(ConnexionService connexionService, SessionService sessions,
            LimiteurTentatives limiteur) {
        this.connexionService = connexionService;
        this.sessions = sessions;
        this.limiteur = limiteur;
    }

    @PostMapping("/login")
    public ResponseEntity<?> seConnecter(
            @Valid @RequestBody ConnexionRequest request) {

        String cle = "echecs:" + request.email().trim().toLowerCase(Locale.ROOT);
        if (limiteur.compter(cle, FENETRE) >= ECHECS_MAX) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                Map.of("error", "Trop d'échecs de connexion. Réessayez dans 15 minutes.")
            );
        }

        try {
            Utilisateur utilisateur = connexionService.seConnecter(request);
            limiteur.oublier(cle);

            // 200 OK : rien n'est créé, contrairement à l'inscription (201).
            // Le cookie de session prouve ensuite qui est connecté (voir AuthInterceptor).
            String jeton = sessions.ouvrir(utilisateur.getId());
            return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, sessions.cookie(jeton).toString())
                .body(Map.of(
                    "message", "Connexion réussie",
                    "id", utilisateur.getId(),
                    "email", utilisateur.getEmail()
                ));

        } catch (IllegalArgumentException e) {
            limiteur.noter(cle);
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        }
    }
}
