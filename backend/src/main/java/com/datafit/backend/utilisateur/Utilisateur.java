package com.datafit.backend.utilisateur;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

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

    // quand le consentement au traitement des données de santé a été donné (RGPD, article 9) :
    // vide tant qu'il n'est pas donné (comptes plus anciens, comptes créés avec Google)
    @Column(name = "sante_acceptee_le")
    private LocalDateTime santeAccepteeLe;

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

    // Note la date du consentement. Un consentement déjà donné garde sa date d'origine.
    public void accepterSante() {
        if (this.santeAccepteeLe == null) {
            // à la microseconde, la précision de PostgreSQL : la date renvoyée tout de suite est celle
            // qu'on relira en base (sinon elle différerait par les nanosecondes)
            this.santeAccepteeLe = LocalDateTime.now().truncatedTo(ChronoUnit.MICROS);
        }
    }

    public LocalDateTime getSanteAccepteeLe() {
        return santeAccepteeLe;
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
}
