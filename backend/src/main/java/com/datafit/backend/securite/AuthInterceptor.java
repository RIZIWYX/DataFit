package com.datafit.backend.securite;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

// Le contrôle d'accès de toute l'API (/api/**), avant chaque contrôleur :
//   1. quelques routes sont publiques (connexion, inscription, contact, webhook Stripe) ;
//      les plus sensibles ont une limite d'essais par adresse IP ;
//   2. toutes les autres exigent un cookie de session valide (sinon 401) ;
//   3. si l'adresse contient {utilisateurId}, ce numéro doit être celui du compte connecté
//      (sinon 403). C'est ce qui empêche de lire ou modifier les données d'un autre compte
//      en changeant le nombre dans l'URL (faille IDOR / BOLA).
@Component
public class AuthInterceptor implements HandlerInterceptor {

    // le compte connecté, pour les contrôleurs qui en ont besoin (ex. création du profil)
    public static final String ATTRIBUT_UTILISATEUR = "datafit.utilisateurId";

    private static final Duration UNE_HEURE = Duration.ofHours(1);
    private static final Duration QUINZE_MINUTES = Duration.ofMinutes(15);

    private record Limite(int max, Duration fenetre) {}

    // routes sans session (méthode + chemin), avec leur limite d'essais par IP (null : aucune)
    private static final Map<String, Limite> PUBLIQUES_LIMITEES = Map.of(
        "POST /api/auth/login", new Limite(30, QUINZE_MINUTES),
        "POST /api/auth/google", new Limite(30, QUINZE_MINUTES),
        "POST /api/auth/register", new Limite(10, UNE_HEURE),
        "POST /api/contact", new Limite(5, UNE_HEURE)
    );

    private static final Set<String> PUBLIQUES_LIBRES = Set.of(
        "GET /api/auth/google/config",
        "POST /api/auth/logout",
        // appelé par Stripe, pas par un navigateur : protégé par la signature de la requête
        "POST /api/stripe/webhook"
    );

    private final SessionService sessions;
    private final LimiteurTentatives limiteur;

    public AuthInterceptor(SessionService sessions, LimiteurTentatives limiteur) {
        this.sessions = sessions;
        this.limiteur = limiteur;
    }

    @Override
    public boolean preHandle(HttpServletRequest requete, HttpServletResponse reponse, Object handler)
            throws IOException {
        // la pré-vérification CORS (OPTIONS) ne porte pas de cookie
        if ("OPTIONS".equals(requete.getMethod())) return true;

        String route = requete.getMethod() + " " + requete.getRequestURI();

        Limite limite = PUBLIQUES_LIMITEES.get(route);
        if (limite != null) {
            if (!limiteur.autoriser(route + " " + requete.getRemoteAddr(), limite.max(), limite.fenetre())) {
                return refuser(reponse, 429, "Trop de tentatives. Réessayez dans quelques minutes.");
            }
            return true;
        }
        if (PUBLIQUES_LIBRES.contains(route)) return true;

        Optional<Long> compte = sessions.utilisateurDe(jeton(requete));
        if (compte.isEmpty()) {
            return refuser(reponse, 401, "Connexion requise.");
        }

        @SuppressWarnings("unchecked")
        Map<String, String> variables =
            (Map<String, String>) requete.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if (variables != null && variables.containsKey("utilisateurId")
                && !String.valueOf(compte.get()).equals(variables.get("utilisateurId"))) {
            return refuser(reponse, 403, "Accès refusé.");
        }

        requete.setAttribute(ATTRIBUT_UTILISATEUR, compte.get());
        return true;
    }

    static String jeton(HttpServletRequest requete) {
        Cookie[] cookies = requete.getCookies();
        if (cookies == null) return null;
        for (Cookie cookie : cookies) {
            if (SessionService.NOM_COOKIE.equals(cookie.getName())) return cookie.getValue();
        }
        return null;
    }

    // même forme que nos autres erreurs : { "error": "message en français" }
    private static boolean refuser(HttpServletResponse reponse, int statut, String message) throws IOException {
        reponse.setStatus(statut);
        reponse.setContentType(MediaType.APPLICATION_JSON_VALUE);
        reponse.setCharacterEncoding("UTF-8");
        reponse.getWriter().write("{\"error\":\"" + message + "\"}");
        return false;
    }
}
