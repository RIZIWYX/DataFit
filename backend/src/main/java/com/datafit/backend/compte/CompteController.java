package com.datafit.backend.compte;

import com.datafit.backend.abonnement.PaiementIndisponibleException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;

// Le compte lui-même (page Profil).
//   POST /api/compte/{utilisateurId}/suppression  -> { motDePasse } ; 204 : compte et données effacés
//   POST /api/compte/{utilisateurId}/effacement   -> { categories, motDePasse } ; 204 : ces données
//        effacées, le compte et le profil restent (categories : "seances", "sommeil", "nutrition", "performances")
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

    private static ResponseEntity<Map<String, String>> erreur(HttpStatus statut, String message) {
        return ResponseEntity.status(statut).body(Map.of("error", message));
    }
}
