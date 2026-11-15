package com.datafit.backend.compte;

import com.datafit.backend.abonnement.PaiementIndisponibleException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;

// Le compte lui-même (page Profil).
//   POST /api/compte/{utilisateurId}/suppression  -> { motDePasse } ; 204 : compte et données effacés
//   POST /api/compte/{utilisateurId}/effacement   -> { categories, motDePasse } ; 204 : ces données
//        effacées, le compte et le profil restent (categories : "seances", "sommeil", "nutrition", "performances")
//   GET  /api/compte/{utilisateurId}/mot-de-passe  -> { defini } : faux pour un compte Google sans mot de passe
//   POST /api/compte/{utilisateurId}/mot-de-passe  -> { motDePasseActuel, nouveauMotDePasse } ; 204 : changé
// POST plutôt que DELETE : le mot de passe voyage dans le corps de la requête, et un corps sur
// un DELETE n'est pas transmis partout (certains proxys le retirent).
@RestController
@RequestMapping("/api/compte")
public class CompteController {

    private final CompteService compteService;

    public CompteController(CompteService compteService) {
        this.compteService = compteService;
    }

    @PostMapping("/{utilisateurId}/suppression")
    public ResponseEntity<?> supprimer(
            @PathVariable Long utilisateurId,
            @Valid @RequestBody SuppressionRequest request) {
        try {
            compteService.supprimer(utilisateurId, request.motDePasse());
            return ResponseEntity.noContent().build();
        } catch (MotDePasseIncorrectException e) {
            return erreur(HttpStatus.FORBIDDEN, e.getMessage());
        } catch (NoSuchElementException e) {
            return erreur(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (PaiementIndisponibleException e) {
            return erreur(HttpStatus.SERVICE_UNAVAILABLE,
                "Votre abonnement Premium n'a pas pu être arrêté : le compte n'a pas été supprimé. "
                    + "Réessayez dans quelques minutes.");
        }
    }

    @PostMapping("/{utilisateurId}/effacement")
    public ResponseEntity<?> effacer(
            @PathVariable Long utilisateurId,
            @Valid @RequestBody EffacementRequest request) {
        try {
            compteService.effacerDonnees(utilisateurId, request.motDePasse(), request.categories());
            return ResponseEntity.noContent().build();
        } catch (MotDePasseIncorrectException e) {
            return erreur(HttpStatus.FORBIDDEN, e.getMessage());
        } catch (NoSuchElementException e) {
            return erreur(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/{utilisateurId}/mot-de-passe")
    public ResponseEntity<?> etatMotDePasse(@PathVariable Long utilisateurId) {
        try {
            return ResponseEntity.ok(Map.of("defini", compteService.motDePasseDefini(utilisateurId)));
        } catch (NoSuchElementException e) {
            return erreur(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @PostMapping("/{utilisateurId}/mot-de-passe")
    public ResponseEntity<?> changerMotDePasse(
            @PathVariable Long utilisateurId,
            @Valid @RequestBody MotDePasseRequest request) {
        try {
            compteService.changerMotDePasse(
                utilisateurId, request.motDePasseActuel(), request.nouveauMotDePasse());
            return ResponseEntity.noContent().build();
        } catch (MotDePasseIncorrectException e) {
            return erreur(HttpStatus.FORBIDDEN, "Mot de passe actuel incorrect");
        } catch (IllegalArgumentException e) {
            return erreur(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (NoSuchElementException e) {
            return erreur(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    // Champ refusé par la validation (@Valid) : { error: "message" }, comme nos autres réponses
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> champInvalide(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(erreur -> erreur.getDefaultMessage())
            .orElse("Les informations envoyées sont invalides");
        return erreur(HttpStatus.BAD_REQUEST, message);
    }

    private static ResponseEntity<Map<String, String>> erreur(HttpStatus statut, String message) {
        return ResponseEntity.status(statut).body(Map.of("error", message));
    }
}
