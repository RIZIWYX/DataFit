package com.datafit.backend.profil;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

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

    // Le profil d'un compte, pour remplir la page Profil
    @GetMapping("/{utilisateurId}")
    public ResponseEntity<?> lireProfil(@PathVariable Long utilisateurId) {
        try {
            return ResponseEntity.ok(versJson(profilService.lireProfil(utilisateurId)));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // Modification du profil depuis la page Profil (tous les champs sont renvoyés)
    @PutMapping("/{utilisateurId}")
    public ResponseEntity<?> modifierProfil(
            @PathVariable Long utilisateurId,
            @Valid @RequestBody ProfilModificationRequest request) {

        try {
            return ResponseEntity.ok(versJson(profilService.modifierProfil(utilisateurId, request)));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Champ refusé par la validation (@Valid) : { error: "message du premier champ en erreur" },
    // comme nos autres réponses, pour que la page affiche un message lisible
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> champInvalide(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(erreur -> erreur.getDefaultMessage())
            .orElse("Les informations envoyées sont invalides");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    // Le profil en JSON, sans l'utilisateur lié (chargé à la demande, il ne doit pas être sérialisé)
    private static Map<String, Object> versJson(Profil profil) {
        Map<String, Object> json = new LinkedHashMap<>();
        json.put("utilisateurId", profil.getUtilisateurId());
        json.put("nom", profil.getNom());
        json.put("prenom", profil.getPrenom());
        json.put("sexe", profil.getSexe());
        json.put("poids", profil.getPoids());
        json.put("taille", profil.getTaille());
        json.put("objectif", profil.getObjectif());
        json.put("niveau", profil.getNiveau());
        json.put("activite", profil.getActivite());
        json.put("dateNaissance", profil.getDateNaissance().toString());
        return json;
    }
}
