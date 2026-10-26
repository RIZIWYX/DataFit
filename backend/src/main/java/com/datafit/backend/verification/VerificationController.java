package com.datafit.backend.verification;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Même début d'adresse que l'inscription et la connexion :
// /api/auth/verifier (le lien du mail) et /api/auth/renvoyer-verification
@RestController
@RequestMapping("/api/auth")
public class VerificationController {

    public record JetonRequest(@NotBlank @Size(max = 128) String jeton) {}

    public record RenvoiRequest(@NotBlank @Email @Size(max = 255) String email) {}

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    // POST et pas GET : la page /verifier-email du site l'appelle elle-même. Un lien GET pourrait
    // être ouvert à l'avance par l'antivirus d'une messagerie, qui consommerait le jeton.
    @PostMapping("/verifier")
    public ResponseEntity<?> verifier(@Valid @RequestBody JetonRequest request) {
        try {
            var utilisateur = verificationService.confirmer(request.jeton());
            return ResponseEntity.ok(Map.of(
                "message", "Adresse e-mail confirmée",
                "email", utilisateur.getEmail()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // toujours la même réponse : elle ne révèle pas si l'adresse a un compte
    @PostMapping("/renvoyer-verification")
    public ResponseEntity<?> renvoyer(@Valid @RequestBody RenvoiRequest request) {
        verificationService.renvoyer(request.email());
        return ResponseEntity.ok(Map.of(
            "message", "Si un compte non confirmé existe pour cette adresse, un nouveau lien vient de partir."
        ));
    }
}
