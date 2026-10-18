package com.datafit.backend.profil;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profil")
public class ProfilController {

    private final ProfilService profilService;

    public ProfilController(ProfilService profilService) {
        this.profilService = profilService;
    }

    @PostMapping("/register/profil")
    public ResponseEntity<?> creerProfil(
            @Valid @RequestBody ProfilRequest request) {

        try {
            Profil profil = profilService.creerProfil(request);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "message", "Profil créé",
                    "utilisateurId", request.utilisateurId(),
                    "nom", profil.getNom(),
                    "prenom", profil.getPrenom()
                )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        }
    }
}
