package com.datafit.backend.abonnement;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.StripeObject;
import com.stripe.model.Subscription;
import com.stripe.model.SubscriptionItem;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

// Tout ce qui parle à Stripe : création des pages de paiement et du portail client,
// vérification et lecture des webhooks. Les clés viennent du .env (jamais du code ni du navigateur).
@Service
public class StripeService {

    private final String cleSecrete;
    private final String secretWebhook;
    private final String prixMensuel;
    private final String prixAnnuel;
    private final String urlSite;

    public StripeService(
            @Value("${stripe.secret-key:}") String cleSecrete,
            @Value("${stripe.webhook-secret:}") String secretWebhook,
            @Value("${stripe.prix.mensuel:}") String prixMensuel,
            @Value("${stripe.prix.annuel:}") String prixAnnuel,
            @Value("${site.url:http://localhost:5173}") String urlSite) {
        this.cleSecrete = cleSecrete;
        this.secretWebhook = secretWebhook;
        this.prixMensuel = prixMensuel;
        this.prixAnnuel = prixAnnuel;
        this.urlSite = urlSite.replaceAll("/$", "");
    }

    @PostConstruct
    void configurer() {
        if (!cleSecrete.isBlank()) Stripe.apiKey = cleSecrete;
    }

    public boolean estConfigure() {
        return !cleSecrete.isBlank() && !secretWebhook.isBlank() && !prixMensuel.isBlank() && !prixAnnuel.isBlank();
    }

    // Page de paiement Stripe (Checkout) pour un abonnement. Renvoie son adresse.
    // Le prix est choisi ici à partir de la périodicité : le navigateur n'envoie jamais de montant.
    public String creerPagePaiement(Long utilisateurId, String email, String periodicite) {
        verifierConfiguration();
        String prix = "annuel".equals(periodicite) ? prixAnnuel : prixMensuel;

        SessionCreateParams params = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
            .addLineItem(SessionCreateParams.LineItem.builder().setPrice(prix).setQuantity(1L).build())
            // le webhook retrouvera le compte DataFit grâce à cet identifiant
            .setClientReferenceId(String.valueOf(utilisateurId))
            .setCustomerEmail(email)
            .setSuccessUrl(urlSite + "/premium?paiement=reussi")
            .setCancelUrl(urlSite + "/premium?paiement=annule")
            .build();
        try {
            return com.stripe.model.checkout.Session.create(params).getUrl();
        } catch (StripeException e) {
            throw new PaiementIndisponibleException("Le paiement est indisponible pour le moment.", e);
        }
    }

    // Portail client Stripe : changer de carte, de formule, résilier ou réactiver. Renvoie son adresse.
    public String creerPortail(String customerId) {
        verifierConfiguration();
        var params = com.stripe.param.billingportal.SessionCreateParams.builder()
            .setCustomer(customerId)
            .setReturnUrl(urlSite + "/premium")
            .build();
        try {
            return com.stripe.model.billingportal.Session.create(params).getUrl();
        } catch (StripeException e) {
            throw new PaiementIndisponibleException("Le portail d'abonnement est indisponible pour le moment.", e);
        }
    }

    // Vérifie que l'événement vient bien de Stripe (signature HMAC avec le secret du webhook).
    // Sans cette vérification, n'importe qui pourrait s'activer un abonnement en appelant l'adresse.
    public Event lireEvenement(String corps, String signature) throws SignatureVerificationException {
        verifierConfiguration();
        if (signature == null || signature.isBlank()) {
            throw new SignatureVerificationException("En-tête Stripe-Signature absent", signature);
        }
        return Webhook.constructEvent(corps, signature, secretWebhook);
    }

    // l'objet contenu dans l'événement (session de paiement, abonnement...)
    public StripeObject objetDe(Event evenement) {
        var lecteur = evenement.getDataObjectDeserializer();
        return lecteur.getObject().orElseGet(() -> {
            try {
                // version d'API du compte différente de celle de la bibliothèque : lecture quand même
                return lecteur.deserializeUnsafe();
            } catch (Exception e) {
                throw new IllegalStateException("Événement Stripe illisible : " + evenement.getType(), e);
            }
        });
    }

    // relit l'abonnement chez Stripe : l'état le plus récent, quel que soit l'ordre d'arrivée des événements
    public EtatStripe lireAbonnement(String subscriptionId) {
        try {
            return etatDe(Subscription.retrieve(subscriptionId));
        } catch (StripeException e) {
            throw new PaiementIndisponibleException("Abonnement Stripe illisible.", e);
        }
    }

    public EtatStripe etatDe(Subscription abonnement) {
        SubscriptionItem ligne = abonnement.getItems().getData().get(0);
        String prix = ligne.getPrice().getId();
        String statut = abonnement.getStatus();
        return new EtatStripe(
            abonnement.getId(),
            abonnement.getCustomer(),
            prixAnnuel.equals(prix) ? "annuel" : "mensuel",
            // la fin de période est portée par la ligne de l'abonnement (API Stripe récente)
            enDate(ligne.getCurrentPeriodEnd()),
            // le portail peut résilier "en fin de période" de deux façons selon sa configuration
            Boolean.TRUE.equals(abonnement.getCancelAtPeriodEnd()) || abonnement.getCancelAt() != null,
            "active".equals(statut) || "trialing".equals(statut) || "past_due".equals(statut)
        );
    }

    private static LocalDateTime enDate(Long secondes) {
        return LocalDateTime.ofInstant(Instant.ofEpochSecond(secondes), ZoneId.systemDefault());
    }

    private void verifierConfiguration() {
        if (!estConfigure()) {
            throw new PaiementIndisponibleException(
                "Paiement non configuré : renseignez les clés Stripe dans le fichier .env.", null);
        }
    }
}
