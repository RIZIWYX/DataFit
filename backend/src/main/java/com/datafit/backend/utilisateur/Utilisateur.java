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
