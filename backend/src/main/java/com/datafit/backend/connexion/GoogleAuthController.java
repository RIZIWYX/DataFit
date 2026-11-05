package com.datafit.backend.connexion;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

// « Continuer avec Google » : le site reçoit de Google un jeton d'identité (credential) et nous
// l'envoie. On le fait vérifier par Google, puis on connecte le compte qui a cette adresse,
// ou on le crée. La réponse est la même que /api/auth/login : { id, email }.
@RestController
@RequestMapping("/api/auth/google")
public class GoogleAuthController {

    private final JdbcTemplate jdbc;
    private final String clientId;
    private final RestClient google = RestClient.create("https://oauth2.googleapis.com");

    public GoogleAuthController(JdbcTemplate jdbc, @Value("${google.client-id:}") String clientId) {
        this.jdbc = jdbc;
        this.clientId = clientId;
    }

    // le site demande l'identifiant client pour afficher le bouton (vide : pas de bouton)
    @GetMapping("/config")
    public Map<String, String> config() {
        return Map.of("clientId", clientId);
    }

    public record GoogleRequest(String credential) {}

    @PostMapping
    public ResponseEntity<?> connecter(@RequestBody GoogleRequest requete) {
        if (clientId.isBlank()) {
            return erreur(HttpStatus.SERVICE_UNAVAILABLE, "La connexion Google n'est pas configurée.");
        }
        if (requete == null || requete.credential() == null || requete.credential().isBlank()) {
            return erreur(HttpStatus.BAD_REQUEST, "Jeton Google manquant.");
        }

        // Google vérifie la signature et l'expiration du jeton et nous rend son contenu
        Map<?, ?> jeton;
        try {
            jeton = google.get()
                    .uri(u -> u.path("/tokeninfo").queryParam("id_token", requete.credential()).build())
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException e) {
            return erreur(HttpStatus.UNAUTHORIZED, "Connexion Google refusée.");
        }

        // le jeton doit avoir été émis pour NOTRE application, avec une adresse vérifiée par Google
        if (jeton == null
                || !clientId.equals(jeton.get("aud"))
                || !"true".equals(String.valueOf(jeton.get("email_verified")))
                || jeton.get("email") == null) {
            return erreur(HttpStatus.UNAUTHORIZED, "Connexion Google refusée.");
        }
        String email = String.valueOf(jeton.get("email")).trim().toLowerCase();

        List<Integer> ids = jdbc.queryForList(
                "SELECT id FROM utilisateur WHERE lower(email) = ?", Integer.class, email);
        int id;
        if (ids.isEmpty()) {
            // nouveau compte : pas de mot de passe connu (une valeur aléatoire hachée, que personne
            // ne connaît ; « mot de passe oublié » permet d'en choisir un plus tard).
            // L'adresse est déjà vérifiée par Google, et le bouton indique l'acceptation des CGU.
            LocalDateTime maintenant = LocalDateTime.now();
            id = jdbc.queryForObject(
                    "INSERT INTO utilisateur (email, mot_de_passe, email_verifie_le, cgu_acceptees_le) "
                            + "VALUES (?, ?, ?, ?) RETURNING id",
                    Integer.class,
                    email, BCrypt.hashpw(UUID.randomUUID().toString(), BCrypt.gensalt()), maintenant, maintenant);
        } else {
            id = ids.get(0);
            // compte créé par e-mail mais jamais confirmé : Google vient de confirmer l'adresse
            jdbc.update("UPDATE utilisateur SET email_verifie_le = now(), jeton_verification_hash = NULL, "
                    + "jeton_expire_le = NULL WHERE id = ? AND email_verifie_le IS NULL", id);
        }

        return ResponseEntity.ok(Map.of("id", id, "email", email));
    }

    private static ResponseEntity<Map<String, String>> erreur(HttpStatus statut, String message) {
        return ResponseEntity.status(statut).body(Map.of("error", message));
    }
}
