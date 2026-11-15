package com.datafit.backend.securite;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

// Le contrôle d'accès de l'API, testé sans serveur ni base : la table des sessions est simulée.
class AuthInterceptorTest {

    private SessionService sessions;
    private AuthInterceptor interceptor;

    @BeforeEach
    void preparer() {
        sessions = mock(SessionService.class);
        interceptor = new AuthInterceptor(sessions, new LimiteurTentatives());
        when(sessions.utilisateurDe("jeton-de-1")).thenReturn(Optional.of(1L));
    }

    private static MockHttpServletRequest requete(String methode, String chemin, String jeton, String utilisateurId) {
        MockHttpServletRequest r = new MockHttpServletRequest(methode, chemin);
        r.setRemoteAddr("10.0.0.1");
        if (jeton != null) r.setCookies(new Cookie(SessionService.NOM_COOKIE, jeton));
        // ce que Spring MVC remplit quand la route contient {utilisateurId}
        if (utilisateurId != null) {
            r.setAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE, Map.of("utilisateurId", utilisateurId));
        }
        return r;
    }

    @Test
    void sansCookieOnRecoit401() throws Exception {
        MockHttpServletResponse reponse = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(requete("GET", "/api/sommeil/1", null, "1"), reponse, null));
        assertEquals(401, reponse.getStatus());
    }

    @Test
    void jetonInconnuOuExpireOn401() throws Exception {
        when(sessions.utilisateurDe("faux")).thenReturn(Optional.empty());
        MockHttpServletResponse reponse = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(requete("GET", "/api/sommeil/1", "faux", "1"), reponse, null));
        assertEquals(401, reponse.getStatus());
    }

    // le cœur de la correction : le compte 1 ne peut plus lire ni modifier les données du compte 2
    @Test
    void lAdresseDUnAutreCompteEstRefusee403() throws Exception {
        MockHttpServletResponse reponse = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(requete("GET", "/api/sommeil/2", "jeton-de-1", "2"), reponse, null));
        assertEquals(403, reponse.getStatus());
    }

    @Test
    void lAdresseDeSonPropreCompteEstAcceptee() throws Exception {
        MockHttpServletRequest requete = requete("GET", "/api/sommeil/1", "jeton-de-1", "1");
        assertTrue(interceptor.preHandle(requete, new MockHttpServletResponse(), null));
        assertEquals(1L, requete.getAttribute(AuthInterceptor.ATTRIBUT_UTILISATEUR));
    }

    @Test
    void uneRouteSansIdentifiantDansLAdresseExigeQuandMemeUneSession() throws Exception {
        MockHttpServletResponse reponse = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(requete("POST", "/api/profil/register/profil", null, null), reponse, null));
        assertEquals(401, reponse.getStatus());
        assertTrue(interceptor.preHandle(
            requete("POST", "/api/profil/register/profil", "jeton-de-1", null), new MockHttpServletResponse(), null));
    }

    @Test
    void lesRoutesPubliquesNExigentPasDeSession() throws Exception {
        for (String route : new String[] {
                "POST /api/auth/login", "POST /api/auth/register", "POST /api/auth/google",
                "GET /api/auth/google/config", "POST /api/auth/logout", "POST /api/contact",
                "POST /api/stripe/webhook"}) {
            String[] morceaux = route.split(" ");
            assertTrue(interceptor.preHandle(
                requete(morceaux[0], morceaux[1], null, null), new MockHttpServletResponse(), null), route);
        }
    }

    @Test
    void laConnexionEstLimiteeParAdresseIp() throws Exception {
        for (int i = 0; i < 30; i++) {
            assertTrue(interceptor.preHandle(
                requete("POST", "/api/auth/login", null, null), new MockHttpServletResponse(), null));
        }
        MockHttpServletResponse reponse = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(requete("POST", "/api/auth/login", null, null), reponse, null));
        assertEquals(429, reponse.getStatus());

        // une autre adresse IP n'est pas touchée
        MockHttpServletRequest autre = requete("POST", "/api/auth/login", null, null);
        autre.setRemoteAddr("10.0.0.2");
        assertTrue(interceptor.preHandle(autre, new MockHttpServletResponse(), null));
    }

    @Test
    void leFormulaireDeContactEstLimite() throws Exception {
        for (int i = 0; i < 5; i++) {
            assertTrue(interceptor.preHandle(
                requete("POST", "/api/contact", null, null), new MockHttpServletResponse(), null));
        }
        MockHttpServletResponse reponse = new MockHttpServletResponse();
        assertFalse(interceptor.preHandle(requete("POST", "/api/contact", null, null), reponse, null));
        assertEquals(429, reponse.getStatus());
    }

    @Test
    void laPreVerificationCorsPasseSansCookie() throws Exception {
        assertTrue(interceptor.preHandle(
            requete("OPTIONS", "/api/sommeil/1", null, "1"), new MockHttpServletResponse(), null));
    }
}
