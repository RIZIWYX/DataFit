package com.datafit.backend.verification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

// Envoie un mail avec Resend (POST https://api.resend.com/emails).
// La clé vient de RESEND_API_KEY (.env, jamais commité). Sans clé (en développement), rien n'est
// envoyé : le mail est écrit dans la console du backend, lien compris, pour pouvoir tester.
@Component
public class EnvoiMail {

    private static final Logger log = LoggerFactory.getLogger(EnvoiMail.class);

    private final RestClient http;
    private final String cleApi;
    private final String expediteur;

    public EnvoiMail(
            @Value("${resend.url:https://api.resend.com}") String url,
            @Value("${resend.api-key:}") String cleApi,
            @Value("${mail.expediteur:DataFit <onboarding@resend.dev>}") String expediteur) {
        this.http = RestClient.create(url);
        this.cleApi = sansGuillemets(cleApi);
        this.expediteur = sansGuillemets(expediteur);
    }

    // .env met l'expéditeur entre guillemets (il contient des espaces, et lancer.sh le lit avec bash) ;
    // Docker les retire, mais pas Spring quand il lit .env lui-même (backend lancé avec ./mvnw)
    private static String sansGuillemets(String valeur) {
        String v = valeur.trim();
        return v.length() >= 2 && v.startsWith("\"") && v.endsWith("\"") ? v.substring(1, v.length() - 1) : v;
    }

    public boolean estConfigure() {
        return !cleApi.isBlank();
    }

    // Lève une exception si Resend refuse le mail (clé invalide, domaine non vérifié…) :
    // l'appelant décide quoi en faire.
    public void envoyer(String destinataire, String sujet, String html, String texte) {
        if (!estConfigure()) {
            log.warn("RESEND_API_KEY absente : mail non envoyé à {} (« {} »).\n{}", destinataire, sujet, texte);
            return;
        }

        http.post()
            .uri("/emails")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + cleApi)
            .contentType(MediaType.APPLICATION_JSON)
            .body(Map.of(
                "from", expediteur,
                "to", List.of(destinataire),
                "subject", sujet,
                "html", html,
                "text", texte
            ))
            .retrieve()
            .toBodilessEntity();
    }
}
