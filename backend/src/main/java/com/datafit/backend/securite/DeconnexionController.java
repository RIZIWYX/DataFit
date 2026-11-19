package com.datafit.backend.securite;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;

// POST /api/auth/logout : ferme la session côté serveur et efface le cookie du navigateur.
// Route publique : se déconnecter d'une session déjà expirée ne doit pas échouer.
@RestController
@RequestMapping("/api/auth")
public class DeconnexionController {

    private final SessionService sessions;

    public DeconnexionController(SessionService sessions) {
        this.sessions = sessions;
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> seDeconnecter(HttpServletRequest requete) {
        sessions.fermer(AuthInterceptor.jeton(requete));
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, sessions.cookieEffacement().toString())
            .build();
    }
}
