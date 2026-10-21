package com.datafit.backend.nutrition;

import com.datafit.backend.utilisateur.Utilisateur;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

// Une ligne de la table "nutrition" (voir le dossier db/) :
// les apports d'une journée pour un utilisateur.
// Une ligne = un jour (UNIQUE (utilisateur_id, date)) : un utilisateur a donc plusieurs lignes.
// La date est posée à la création et ne change plus, même si on corrige les valeurs.
@Entity
@Table(name = "nutrition")
public class Nutrition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // plusieurs journées pour un même utilisateur (pas de @MapsId : la clé reste la colonne id)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    // posée automatiquement à la création par @PrePersist ; non modifiable ensuite
    @Column(name = "date", nullable = false, updatable = false)
    private LocalDate date;

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
            double calories,
            double proteines,
            double glucides,
            double lipides,
            String objectif) {
        this.utilisateur = utilisateur;
        this.calories = calories;
        this.proteines = proteines;
        this.glucides = glucides;
        this.lipides = lipides;
        this.objectif = objectif;
    }

    // Hibernate appelle cette méthode juste avant l'INSERT en base
    @PrePersist
    protected void avantCreation() {
        this.date = LocalDate.now();
    }

    public Long getId() {
        return id;
    }

    // jamais renvoyé dans le JSON : l'utilisateur n'est pas chargé, et il contient le mot de passe
    @JsonIgnore
    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public LocalDate getDate() {
        return date;
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

    public void setCalories(double calories) {
        this.calories = calories;
    }

    public void setProteines(double proteines) {
        this.proteines = proteines;
    }

    public void setGlucides(double glucides) {
        this.glucides = glucides;
    }

    public void setLipides(double lipides) {
        this.lipides = lipides;
    }

    public void setObjectif(String objectif) {
        this.objectif = objectif;
    }
}
