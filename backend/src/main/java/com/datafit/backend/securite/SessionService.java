package com.datafit.backend.securite;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

// Les sessions de connexion. À la connexion, le serveur tire un jeton aléatoire de 256 bits, le
// donne au navigateur dans un cookie HttpOnly (illisible par le JavaScript de la page, donc par
// une faille XSS) et ne garde en base que son empreinte. Ensuite, chaque appel de l'API porte ce
// cookie : c'est lui, et non plus le numéro dans l'adresse, qui dit QUI appelle (voir AuthInterceptor).
@Service
public class SessionService {

    public static final String NOM_COOKIE = "datafit_session";

    static final Duration DUREE = Duration.ofDays(7);

    private final JdbcTemplate jdbc;
    private final boolean cookieSecurise;
    private final SecureRandom alea = new SecureRandom();

    public SessionService(JdbcTemplate jdbc,
            // true en ligne (HTTPS) : le navigateur n'envoie alors le cookie qu'en HTTPS
            @Value("${datafit.session.cookie-securise:false}") boolean cookieSecurise) {
        this.jdbc = jdbc;
        this.cookieSecurise = cookieSecurise;
    }

    // Ouvre une session pour ce compte et renvoie le jeton (à mettre dans le cookie, jamais en base).
    public String ouvrir(Long utilisateurId) {
        byte[] octets = new byte[32];
        alea.nextBytes(octets);
        String jeton = Base64.getUrlEncoder().withoutPadding().encodeToString(octets);

        // l'heure vient de la base (pas de la JVM) : pas de décalage de fuseau entre les deux
        jdbc.update("DELETE FROM session_utilisateur WHERE expire_le < now()");
        jdbc.update(
            "INSERT INTO session_utilisateur (jeton_hash, utilisateur_id, expire_le) "
                + "VALUES (?, ?, now() + (?::double precision) * interval '1 second')",
            empreinte(jeton), utilisateurId, (double) DUREE.toSeconds());
        return jeton;
    }

    // Le compte à qui appartient ce jeton, s'il est connu et n'a pas expiré.
    public Optional<Long> utilisateurDe(String jeton) {
        if (jeton == null || jeton.isBlank()) return Optional.empty();
        List<Long> ids = jdbc.queryForList(
            "SELECT utilisateur_id FROM session_utilisateur WHERE jeton_hash = ? AND expire_le > now()",
            Long.class, empreinte(jeton));
        return ids.stream().findFirst();
    }

    public void fermer(String jeton) {
        if (jeton == null || jeton.isBlank()) return;
        jdbc.update("DELETE FROM session_utilisateur WHERE jeton_hash = ?", empreinte(jeton));
    }

    // Le cookie à envoyer au navigateur à la connexion.
    public ResponseCookie cookie(String jeton) {
        return base(jeton).maxAge(DUREE).build();
    }

    // Le cookie qui efface celui du navigateur (déconnexion).
    public ResponseCookie cookieEffacement() {
        return base("").maxAge(0).build();
    }

    private ResponseCookie.ResponseCookieBuilder base(String valeur) {
        return ResponseCookie.from(NOM_COOKIE, valeur)
            .httpOnly(true)          // invisible pour le JavaScript de la page
            .secure(cookieSecurise)  // HTTPS seulement, en ligne
            .sameSite("Lax")         // pas envoyé quand un autre site déclenche une requête POST
            .path("/");
    }

    // SHA-256 en hexadécimal (64 caractères). Le jeton étant aléatoire sur 256 bits, pas besoin de sel.
    static String empreinte(String jeton) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(jeton.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
