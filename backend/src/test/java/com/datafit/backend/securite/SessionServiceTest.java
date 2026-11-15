package com.datafit.backend.securite;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

// Sans base : on vérifie ce que SessionService range en base (jamais le jeton lui-même) et le cookie.
class SessionServiceTest {

    @Test
    void laBaseNeGardeQueLEmpreinteDuJeton() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        SessionService service = new SessionService(jdbc, false);

        String jeton = service.ouvrir(7L);

        assertTrue(jeton.length() >= 43, "256 bits en base64 : au moins 43 caractères");
        // le jeton n'est jamais envoyé à la base, seulement son empreinte SHA-256 (64 caractères)
        verify(jdbc).update(contains("INSERT INTO session_utilisateur"),
            eq(SessionService.empreinte(jeton)), eq(7L), any());
        assertEquals(64, SessionService.empreinte(jeton).length());
        assertNotEquals(jeton, SessionService.empreinte(jeton));
    }

    @Test
    void deuxSessionsOntDesJetonsDifferents() {
        SessionService service = new SessionService(mock(JdbcTemplate.class), false);
        assertNotEquals(service.ouvrir(1L), service.ouvrir(1L));
    }

    @Test
    void unJetonVideOuAbsentNeDonneRien() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        SessionService service = new SessionService(jdbc, false);
        assertTrue(service.utilisateurDe(null).isEmpty());
        assertTrue(service.utilisateurDe("  ").isEmpty());
        verifyNoInteractions(jdbc);
    }

    @Test
    void leCookieEstHttpOnlyEtSameSite() {
        ResponseCookie cookie = new SessionService(mock(JdbcTemplate.class), false).cookie("abc");
        assertEquals(SessionService.NOM_COOKIE, cookie.getName());
        assertTrue(cookie.isHttpOnly());
        assertFalse(cookie.isSecure());
        assertEquals("Lax", cookie.getSameSite());
        assertEquals("/", cookie.getPath());
        assertFalse(cookie.getMaxAge().isZero());
    }

    @Test
    void enLigneLeCookieEstSecure() {
        assertTrue(new SessionService(mock(JdbcTemplate.class), true).cookie("abc").isSecure());
    }

    @Test
    void leCookieDEffacementExpireImmediatement() {
        ResponseCookie cookie = new SessionService(mock(JdbcTemplate.class), false).cookieEffacement();
        assertTrue(cookie.getMaxAge().isZero());
        assertEquals("", cookie.getValue());
    }
}
