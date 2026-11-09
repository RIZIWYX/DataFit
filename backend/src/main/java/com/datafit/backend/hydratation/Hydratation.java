package com.datafit.backend.hydratation;

import com.datafit.backend.utilisateur.Utilisateur;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

// Une ligne de la table "hydratation" (voir db/09_hydratation.sql) : un ajout d'eau noté sur la page Nutrition.
// Une ligne par ajout (et pas seulement le total du jour) pour pouvoir annuler le dernier.
@Entity
@Table(name = "hydratation")
public class Hydratation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "ml", nullable = false)
    private int ml;

    @Column(name = "ajoute_le", nullable = false, updatable = false)
    private LocalDateTime ajouteLe;

    protected Hydratation() {
        // Constructeur par défaut requis par JPA
    }

    public Hydratation(Utilisateur utilisateur, LocalDate date, int ml) {
        this.utilisateur = utilisateur;
        this.date = date;
        this.ml = ml;
        this.ajouteLe = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public LocalDate getDate() {
        return date;
    }

    public int getMl() {
        return ml;
    }

    public LocalDateTime getAjouteLe() {
        return ajouteLe;
    }
}
