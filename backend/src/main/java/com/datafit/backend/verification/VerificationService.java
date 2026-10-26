package com.datafit.backend.verification;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;

// Confirmation de l'adresse e-mail :
// 1. à l'inscription, un jeton aléatoire part par mail dans un lien ; seul son SHA-256 est gardé
//    en base, avec une date d'expiration (si la base fuit, les liens restent inutilisables) ;
// 2. au clic, on retrouve le compte par le SHA-256 du jeton reçu ; s'il n'a pas expiré,
//    l'adresse est confirmée et le jeton effacé (un lien ne sert qu'une fois).
// Tant que l'adresse n'est pas confirmée, la connexion est refusée (ConnexionService).
@Service
public class VerificationService {

    private static final Logger log = LoggerFactory.getLogger(VerificationService.class);

    static final Duration VALIDITE_LIEN = Duration.ofHours(24);
    // pas plus d'un mail par minute et par compte : sinon on pourrait vider le quota Resend
    static final Duration DELAI_ENTRE_ENVOIS = Duration.ofMinutes(1);

    private final SecureRandom hasard = new SecureRandom();
    private final UtilisateurRepository utilisateurRepository;
    private final EnvoiMail envoiMail;
    private final String adresseSite;

    public VerificationService(
            UtilisateurRepository utilisateurRepository,
            EnvoiMail envoiMail,
            @Value("${app.url:http://localhost:3000}") String adresseSite) {
        this.utilisateurRepository = utilisateurRepository;
        this.envoiMail = envoiMail;
        this.adresseSite = adresseSite.replaceAll("/+$", "");
    }

    // Crée un nouveau jeton et envoie le lien. Un échec d'envoi n'annule pas l'inscription :
    // il est noté dans la console, et le mail pourra être renvoyé depuis la page de connexion.
    @Transactional
    public void envoyerLien(Utilisateur utilisateur) {
        byte[] octets = new byte[32];
        hasard.nextBytes(octets);
        String jeton = HexFormat.of().formatHex(octets);

        utilisateur.preparerVerification(empreinte(jeton), LocalDateTime.now().plus(VALIDITE_LIEN));
        utilisateurRepository.save(utilisateur);

        String lien = adresseSite + "/verifier-email?jeton=" + jeton;
        try {
            envoiMail.envoyer(utilisateur.getEmail(), "Confirmez votre adresse e-mail", html(lien), texte(lien));
        } catch (RuntimeException e) {
            log.error("Mail de confirmation non envoyé à {} : {}", utilisateur.getEmail(), e.getMessage());
        }
    }

    // Renvoie un lien, sauf si l'adresse est inconnue, déjà confirmée ou si un mail vient de partir.
    // La réponse au navigateur est la même dans tous les cas : elle ne dit pas quelles adresses
    // ont un compte.
    @Transactional
    public void renvoyer(String email) {
        utilisateurRepository.findByEmail(email.trim())
            .filter(u -> !u.emailVerifie())
            .filter(u -> u.getVerificationEnvoyeeLe() == null
                || u.getVerificationEnvoyeeLe().plus(DELAI_ENTRE_ENVOIS).isBefore(LocalDateTime.now()))
            .ifPresent(this::envoyerLien);
    }

    // Lève IllegalArgumentException si le lien est inconnu, déjà utilisé ou expiré.
    @Transactional
    public Utilisateur confirmer(String jeton) {
        Utilisateur utilisateur = utilisateurRepository.findByJetonVerificationHash(empreinte(jeton.trim()))
            .orElseThrow(() -> new IllegalArgumentException(
                "Ce lien n'est pas valide ou a déjà été utilisé."));

        if (utilisateur.getJetonExpireLe() == null || utilisateur.getJetonExpireLe().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                "Ce lien a expiré : connectez-vous pour en recevoir un nouveau.");
        }

        utilisateur.confirmerEmail();
        return utilisateurRepository.save(utilisateur);
    }

    static String empreinte(String jeton) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(jeton.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponible", e); // n'arrive pas : toute JVM l'a
        }
    }

    private static String texte(String lien) {
        return """
            Bienvenue sur DataFit !

            Pour activer votre compte, confirmez votre adresse e-mail en ouvrant ce lien :
            %s

            Ce lien est valable 24 heures. Si vous n'avez pas créé de compte DataFit, ignorez ce message.
            """.formatted(lien);
    }

    private static String html(String lien) {
        return """
            <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#09090a">
              <p style="margin:0 0 24px;font-size:22px;font-weight:800">Data<span style="color:#0cd0d0">fit</span></p>
              <h1 style="margin:0 0 16px;font-size:22px">Confirmez votre adresse e-mail</h1>
              <p style="margin:0 0 24px;line-height:1.5">Bienvenue sur DataFit ! Pour activer votre compte,
                confirmez votre adresse en cliquant sur le bouton ci-dessous.</p>
              <p style="margin:0 0 24px"><a href="%1$s" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#0cd0d0;color:#09090a;font-weight:700;text-decoration:none">Confirmer mon adresse</a></p>
              <p style="margin:0 0 8px;font-size:13px;color:#555">Le bouton ne marche pas ? Copiez ce lien dans votre navigateur :</p>
              <p style="margin:0 0 24px;font-size:13px;word-break:break-all"><a href="%1$s" style="color:#09090a">%1$s</a></p>
              <p style="margin:0;font-size:13px;color:#555">Ce lien est valable 24 heures. Si vous n'avez pas créé
                de compte DataFit, ignorez ce message.</p>
            </div>
            """.formatted(lien);
    }
}
