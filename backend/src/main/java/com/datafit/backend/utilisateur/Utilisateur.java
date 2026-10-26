package com.datafit.backend.utilisateur;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateur")

public class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "mot_de_passe", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "cree_le", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // quand les conditions d'utilisation ont été acceptées (vide pour les comptes plus anciens)
    @Column(name = "cgu_acceptees_le")
    private LocalDateTime cguAccepteesLe;

    // confirmation de l'adresse e-mail (voir le paquet verification)
    @Column(name = "email_verifie_le")
    private LocalDateTime emailVerifieLe;

    // SHA-256 du jeton envoyé par mail : le jeton lui-même n'est jamais enregistré
    @Column(name = "jeton_verification_hash", length = 64)
    private String jetonVerificationHash;

    @Column(name = "jeton_expire_le")
    private LocalDateTime jetonExpireLe;

    @Column(name = "verification_envoyee_le")
    private LocalDateTime verificationEnvoyeeLe;

    protected Utilisateur() {
        // Constructeur par défaut requis par JPA
    }

    public Utilisateur(String email, String passwordHash) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = LocalDateTime.now();
    }

    public void accepterCgu() {
        this.cguAccepteesLe = LocalDateTime.now();
    }

    public boolean emailVerifie() {
        return emailVerifieLe != null;
    }

    // un nouveau lien remplace le précédent : l'ancien jeton ne marche plus
    public void preparerVerification(String hash, LocalDateTime expireLe) {
        this.jetonVerificationHash = hash;
        this.jetonExpireLe = expireLe;
        this.verificationEnvoyeeLe = LocalDateTime.now();
    }

    // le lien ne sert qu'une fois : le jeton est effacé
    public void confirmerEmail() {
        this.emailVerifieLe = LocalDateTime.now();
        this.jetonVerificationHash = null;
        this.jetonExpireLe = null;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getCguAccepteesLe() {
        return cguAccepteesLe;
    }

    public LocalDateTime getJetonExpireLe() {
        return jetonExpireLe;
    }

    public LocalDateTime getVerificationEnvoyeeLe() {
        return verificationEnvoyeeLe;
    }
}
