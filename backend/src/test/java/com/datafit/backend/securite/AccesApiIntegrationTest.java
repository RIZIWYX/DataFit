package com.datafit.backend.securite;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;

import java.net.CookieManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;

// Le contrôle d'accès de l'API, de bout en bout : vrai serveur, vraie base, vrais cookies.
// Il faut une base PostgreSQL avec les tables de db/ (en local : ./lancer.sh ; en CI : le service postgres).
// Chaque compte de test a une adresse « it-...@test.invalid », supprimée à la fin (les tables liées
// partent avec lui, ON DELETE CASCADE).
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AccesApiIntegrationTest {

    private static final String MOT_DE_PASSE = "motdepasse-test-1";
    private static final Pattern ID = Pattern.compile("\"id\":(\\d+)");

    @LocalServerPort
    int port;

    @Autowired
    JdbcTemplate jdbc;

    // un « navigateur » par personne : son propre cookie de session
    record Navigateur(HttpClient http, CookieManager cookies) {
        static Navigateur neuf() {
            CookieManager cookies = new CookieManager();
            return new Navigateur(HttpClient.newBuilder().cookieHandler(cookies).build(), cookies);
        }
    }

    record Reponse(int statut, String corps) {}

    record Compte(Navigateur navigateur, long id, String email) {}

    private Compte alice;
    private Compte bob;

    @BeforeAll
    void creerDeuxComptes() throws Exception {
        alice = inscrire();
        bob = inscrire();
    }

    @AfterAll
    void nettoyer() {
        jdbc.update("DELETE FROM utilisateur WHERE email LIKE 'it-%@test.invalid'");
        jdbc.update("DELETE FROM message_contact WHERE email = 'it@test.invalid'");
    }

    // ---------- outils ----------

    private Reponse envoyer(Navigateur n, String methode, String chemin, String json) throws Exception {
        HttpRequest.Builder requete = HttpRequest.newBuilder(URI.create("http://localhost:" + port + chemin));
        if (json == null) {
            requete.method(methode, HttpRequest.BodyPublishers.noBody());
        } else {
            requete.header("Content-Type", "application/json").method(methode, HttpRequest.BodyPublishers.ofString(json));
        }
        HttpResponse<String> reponse = n.http().send(requete.build(), HttpResponse.BodyHandlers.ofString());
        return new Reponse(reponse.statusCode(), reponse.body());
    }

    private static String adresseUnique() {
        return "it-" + UUID.randomUUID().toString().substring(0, 8) + "@test.invalid";
    }

    private Compte inscrire() throws Exception {
        Navigateur n = Navigateur.neuf();
        String email = adresseUnique();
        Reponse r = envoyer(n, "POST", "/api/auth/register",
            "{\"email\":\"%s\",\"password\":\"%s\",\"cguAcceptees\":true,\"santeAcceptee\":true}".formatted(email, MOT_DE_PASSE));
        assertEquals(201, r.statut(), r.corps());
        Matcher m = ID.matcher(r.corps());
        assertTrue(m.find(), r.corps());
        return new Compte(n, Long.parseLong(m.group(1)), email);
    }

    private static final String PROFIL =
        "\"nom\":\"Dupont\",\"prenom\":\"Alice\",\"sexe\":\"F\",\"poids\":60,\"taille\":170,"
            + "\"objectif\":\"x\",\"niveau\":\"novice\",\"activite\":\"course\",\"dateNaissance\":\"1990-01-01\"";

    // ---------- sans session ----------

    @Test
    @Order(1)
    void sansSessionTouteLApiProtegeeRepond401() throws Exception {
        Navigateur anonyme = Navigateur.neuf();
        for (String chemin : new String[] {
                "/api/sommeil/" + alice.id(), "/api/profil/" + alice.id(), "/api/sbd/" + alice.id() + "/dernier",
                "/api/abonnement/" + alice.id(), "/api/compte/" + alice.id() + "/consentement-sante",
                "/api/graphiques/progression/" + alice.id()}) {
            assertEquals(401, envoyer(anonyme, "GET", chemin, null).statut(), chemin);
        }
        assertEquals(401, envoyer(anonyme, "POST", "/api/sbd/" + alice.id(), "{}").statut());
        assertEquals(401, envoyer(anonyme, "POST", "/api/compte/" + alice.id() + "/suppression", "{\"motDePasse\":\"x\"}").statut());
    }

    @Test
    @Order(2)
    void unJetonInventeNeDonneRien() throws Exception {
        HttpRequest requete = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/sommeil/" + alice.id()))
            .header("Cookie", SessionService.NOM_COOKIE + "=jeton-invente").GET().build();
        assertEquals(401, HttpClient.newHttpClient().send(requete, HttpResponse.BodyHandlers.ofString()).statusCode());
    }

    @Test
    @Order(3)
    void lesRoutesPubliquesRestentOuvertes() throws Exception {
        Navigateur anonyme = Navigateur.neuf();
        assertEquals(200, envoyer(anonyme, "GET", "/api/auth/google/config", null).statut());
        assertEquals(201, envoyer(anonyme, "POST", "/api/contact",
            "{\"nom\":\"Test\",\"email\":\"it@test.invalid\",\"sujet\":\"question\",\"message\":\"Bonjour\"}").statut());
        // le webhook Stripe n'a pas de session mais exige une signature
        assertNotEquals(401, envoyer(anonyme, "POST", "/api/stripe/webhook", "{}").statut());
    }

    // ---------- isolation entre comptes (IDOR) ----------

    @Test
    @Order(4)
    void unCompteLitSesDonneesMaisPasCellesDUnAutre() throws Exception {
        assertEquals(200, envoyer(alice.navigateur(), "GET", "/api/sommeil/" + alice.id(), null).statut());
        assertEquals(403, envoyer(alice.navigateur(), "GET", "/api/sommeil/" + bob.id(), null).statut());
        assertEquals(403, envoyer(alice.navigateur(), "GET", "/api/profil/" + bob.id(), null).statut());
        assertEquals(403, envoyer(alice.navigateur(), "GET", "/api/abonnement/" + bob.id(), null).statut());
        assertEquals(403, envoyer(alice.navigateur(), "GET", "/api/graphiques/progression/" + bob.id(), null).statut());
    }

    @Test
    @Order(5)
    void unCompteNeModifieNiNeSupprimeLesDonneesDUnAutre() throws Exception {
        assertEquals(403, envoyer(alice.navigateur(), "POST", "/api/sbd/" + bob.id(), "{}").statut());
        assertEquals(403, envoyer(alice.navigateur(), "PUT", "/api/profil/" + bob.id(), "{}").statut());
        assertEquals(403, envoyer(alice.navigateur(), "POST", "/api/compte/" + bob.id() + "/suppression",
            "{\"motDePasse\":\"" + MOT_DE_PASSE + "\"}").statut());
        // le compte de Bob existe toujours
        assertEquals(200, envoyer(bob.navigateur(), "GET", "/api/sommeil/" + bob.id(), null).statut());
    }

    @Test
    @Order(6)
    void leProfilNeSeCreeQuePourSonPropreCompte() throws Exception {
        // le numéro est dans le corps de la requête, pas dans l'adresse : vérifié par le contrôleur
        assertEquals(403, envoyer(alice.navigateur(), "POST", "/api/profil/register/profil",
            "{\"utilisateurId\":" + bob.id() + "," + PROFIL + "}").statut());
        assertEquals(201, envoyer(alice.navigateur(), "POST", "/api/profil/register/profil",
            "{\"utilisateurId\":" + alice.id() + "," + PROFIL + "}").statut());
        assertEquals(200, envoyer(alice.navigateur(), "GET", "/api/profil/" + alice.id(), null).statut());
    }

    // ---------- consentement aux données de santé ----------

    @Test
    @Order(7)
    void lInscriptionExigeLeConsentementSante() throws Exception {
        Navigateur n = Navigateur.neuf();
        String sans = "{\"email\":\"%s\",\"password\":\"%s\",\"cguAcceptees\":true}".formatted(adresseUnique(), MOT_DE_PASSE);
        String refuse = "{\"email\":\"%s\",\"password\":\"%s\",\"cguAcceptees\":true,\"santeAcceptee\":false}".formatted(adresseUnique(), MOT_DE_PASSE);
        assertEquals(400, envoyer(n, "POST", "/api/auth/register", sans).statut());
        assertEquals(400, envoyer(n, "POST", "/api/auth/register", refuse).statut());
    }

    @Test
    @Order(8)
    void leConsentementEstDateALInscriptionEtProtegeParCompte() throws Exception {
        String chemin = "/api/compte/" + alice.id() + "/consentement-sante";
        Reponse lu = envoyer(alice.navigateur(), "GET", chemin, null);
        assertEquals(200, lu.statut());
        assertFalse(lu.corps().contains("null"), "daté à l'inscription : " + lu.corps());

        assertEquals(403, envoyer(bob.navigateur(), "GET", chemin, null).statut());
        assertEquals(403, envoyer(bob.navigateur(), "POST", chemin, null).statut());
    }

    @Test
    @Order(9)
    void unCompteSansConsentementLeDonneEnUneFoisEtGardeSaDate() throws Exception {
        jdbc.update("UPDATE utilisateur SET sante_acceptee_le = NULL WHERE id = ?", bob.id());
        String chemin = "/api/compte/" + bob.id() + "/consentement-sante";

        assertTrue(envoyer(bob.navigateur(), "GET", chemin, null).corps().contains("null"));

        Reponse donne = envoyer(bob.navigateur(), "POST", chemin, null);
        assertEquals(200, donne.statut());
        assertFalse(donne.corps().contains("null"));
        assertEquals(donne.corps(), envoyer(bob.navigateur(), "POST", chemin, null).corps(), "la date d'origine est gardée");
        assertEquals(donne.corps(), envoyer(bob.navigateur(), "GET", chemin, null).corps());
    }

    // ---------- connexion, déconnexion, limites ----------

    @Test
    @Order(10)
    void laDeconnexionFermeLaSessionCoteServeur() throws Exception {
        Compte carole = inscrire();
        String jeton = carole.navigateur().cookies().getCookieStore().getCookies().stream()
            .filter(c -> c.getName().equals(SessionService.NOM_COOKIE)).findFirst().orElseThrow().getValue();
        assertEquals(200, envoyer(carole.navigateur(), "GET", "/api/sommeil/" + carole.id(), null).statut());

        assertEquals(204, envoyer(carole.navigateur(), "POST", "/api/auth/logout", null).statut());
        assertEquals(401, envoyer(carole.navigateur(), "GET", "/api/sommeil/" + carole.id(), null).statut());

        // rejouer l'ancien jeton à la main ne marche pas non plus : il n'existe plus en base
        HttpRequest rejoue = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/sommeil/" + carole.id()))
            .header("Cookie", SessionService.NOM_COOKIE + "=" + jeton).GET().build();
        assertEquals(401, HttpClient.newHttpClient().send(rejoue, HttpResponse.BodyHandlers.ofString()).statusCode());
    }

    @Test
    @Order(11)
    void laConnexionUtiliseLeCookieEtLaBaseNeGardeQueLEmpreinte() throws Exception {
        Navigateur n = Navigateur.neuf();
        Reponse r = envoyer(n, "POST", "/api/auth/login",
            "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(alice.email(), MOT_DE_PASSE));
        assertEquals(200, r.statut(), r.corps());
        String jeton = n.cookies().getCookieStore().getCookies().stream()
            .filter(c -> c.getName().equals(SessionService.NOM_COOKIE)).findFirst().orElseThrow().getValue();

        assertEquals(0, jdbc.queryForObject("SELECT count(*) FROM session_utilisateur WHERE jeton_hash = ?", Integer.class, jeton),
            "le jeton lui-même n'est jamais en base");
        assertEquals(1, jdbc.queryForObject("SELECT count(*) FROM session_utilisateur WHERE jeton_hash = ?", Integer.class,
            SessionService.empreinte(jeton)));
    }

    @Test
    @Order(12)
    void lAdresseEstInsensibleALaCasseEtLesEchecsSontLimites() throws Exception {
        // connexion avec l'adresse en majuscules : même compte
        Navigateur n = Navigateur.neuf();
        assertEquals(200, envoyer(n, "POST", "/api/auth/login",
            "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(alice.email().toUpperCase(), MOT_DE_PASSE)).statut());

        // 5 mauvais mots de passe, puis le blocage, même avec le bon mot de passe
        String cible = bob.email();
        for (int i = 0; i < 5; i++) {
            assertEquals(400, envoyer(Navigateur.neuf(), "POST", "/api/auth/login",
                "{\"email\":\"%s\",\"password\":\"mauvais-mot-de-passe\"}".formatted(cible)).statut(), "essai " + (i + 1));
        }
        assertEquals(429, envoyer(Navigateur.neuf(), "POST", "/api/auth/login",
            "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(cible, MOT_DE_PASSE)).statut());
        // une autre adresse n'est pas touchée
        assertEquals(200, envoyer(Navigateur.neuf(), "POST", "/api/auth/login",
            "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(alice.email(), MOT_DE_PASSE)).statut());
    }
}
