package com.datafit.backend.contact;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// Un message envoyé depuis le formulaire de contact
@Entity
@Table(name = "message_contact")
public class MessageContact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "sujet", nullable = false, length = 50)
    private String sujet;

    @Column(name = "message", nullable = false, length = 2000)
    private String message;

    @Column(name = "envoye_le", nullable = false, updatable = false)
    private LocalDateTime envoyeLe;

    protected MessageContact() {
        // Constructeur par défaut requis par JPA
    }

    public MessageContact(String nom, String email, String sujet, String message) {
        this.nom = nom;
        this.email = email;
        this.sujet = sujet;
        this.message = message;
        this.envoyeLe = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }
}
