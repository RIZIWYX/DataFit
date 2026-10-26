package com.datafit.backend.sommeil;

import com.datafit.backend.utilisateur.Utilisateur;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "sommeil")
public class Sommeil {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "date", nullable = false, updatable = false)
    private LocalDate date;

    @Column(name = "nom", nullable = false, length = 255)
    private String nom;

    @Column(name = "calories", nullable = false)
    private double calories;

    @Column(name = "proteines", nullable = false)
    private double proteines;

    @Column(name = "glucides", nullable = false)
    private double glucides;

    @Column(name = "lipides", nullable = false)
    private double lipides;

    @Column(name = "objectif", nullable = false, length = 255)
    private String objectif;

    protected Sommeil() {
        // Constructeur par défaut requis par JPA
    }

    public Sommeil(
            Utilisateur utilisateur,
            LocalDate date,
            String nom,
            double calories,
            double proteines,
            double glucides,
            double lipides,
            String objectif) {
        this.utilisateur = utilisateur;
        this.date = date;
        this.nom = nom;
        this.calories = calories;
        this.proteines = proteines;
        this.glucides = glucides;
        this.lipides = lipides;
        this.objectif = objectif;
    }

    public Long getId() {
        return id;
    }

    // jamais renvoyé dans le JSON : l'utilisateur n'est pas chargé, et il contient
    // le mot de passe
    @JsonIgnore
    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getNom() {
        return nom;
    }

    public double getCalories() {
        return calories;
    }

    public double getProteines() {
        return proteines;
    }

    public double getGlucides() {
        return glucides;
    }

    public double getLipides() {
        return lipides;
    }

    public String getObjectif() {
        return objectif;
    }
}
