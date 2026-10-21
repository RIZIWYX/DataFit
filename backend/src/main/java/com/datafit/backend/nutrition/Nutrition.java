package com.datafit.backend.nutrition;

import com.datafit.backend.utilisateur.Utilisateur;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

// Une ligne de la table "nutrition" (voir db/02_nutrition.sql) : un repas noté par un utilisateur,
// avec son jour, son moment (petit-dejeuner, dejeuner, diner ou collation), son nom et ses apports.
// Un utilisateur a donc plusieurs lignes par jour. Un repas ne se modifie pas : on le supprime
// et on en note un autre, comme sur la page Nutrition.
@Entity
@Table(name = "nutrition")
public class Nutrition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // plusieurs repas pour un même utilisateur (pas de @MapsId : la clé reste la
    // colonne id)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    // le jour où le repas a été mangé, choisi sur la page (pas forcément aujourd'hui)
    @Column(name = "date", nullable = false, updatable = false)
    private LocalDate date;

    @Column(name = "repas", nullable = false, length = 20)
    private String repas;

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

    protected Nutrition() {
        // Constructeur par défaut requis par JPA
    }

    public Nutrition(
            Utilisateur utilisateur,
            LocalDate date,
            String repas,
            String nom,
            double calories,
            double proteines,
            double glucides,
            double lipides,
            String objectif) {
        this.utilisateur = utilisateur;
        this.date = date;
        this.repas = repas;
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

    public String getRepas() {
        return repas;
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
