package com.datafit.backend.profil;

import com.datafit.backend.utilisateur.Utilisateur;
import jakarta.persistence.*;

import java.time.LocalDate;

// Une ligne de la table "profil" (voir db/init.sql) : les informations d'un utilisateur.
@Entity
@Table(name = "profil")
public class Profil {

    // la clé du profil est celle de son utilisateur (colonne utilisateur_id) :
    // un utilisateur a au plus un profil
    @Id
    private Long utilisateurId;

    // @MapsId : la clé ci-dessus est recopiée depuis l'utilisateur lié
    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    @Column(name = "nom", nullable = false, length = 255)
    private String nom;

    @Column(name = "prenom", nullable = false, length = 255)
    private String prenom;

    @Column(name = "sexe", nullable = false, length = 10)
    private String sexe;

    @Column(name = "poids", nullable = false)
    private double poids;

    @Column(name = "taille", nullable = false)
    private double taille;

    @Column(name = "objectif", nullable = false, length = 255)
    private String objectif;

    @Column(name = "niveau", nullable = false, length = 50)
    private String niveau;

    @Column(name = "activite", nullable = false, length = 50)
    private String activite;

    @Column(name = "date_naissance", nullable = false)
    private LocalDate dateNaissance;

    protected Profil() {
        // Constructeur par défaut requis par JPA
    }

    public Profil(
            Utilisateur utilisateur,
            String nom,
            String prenom,
            String sexe,
            double poids,
            double taille,
            String objectif,
            String niveau,
            String activite,
            LocalDate dateNaissance) {
        this.utilisateur = utilisateur;
        this.nom = nom;
        this.prenom = prenom;
        this.sexe = sexe;
        this.poids = poids;
        this.taille = taille;
        this.objectif = objectif;
        this.niveau = niveau;
        this.activite = activite;
        this.dateNaissance = dateNaissance;
    }

    public Long getUtilisateurId() {
        return utilisateurId;
    }

    public String getNom() {
        return nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public String getSexe() {
        return sexe;
    }

    public double getPoids() {
        return poids;
    }

    public double getTaille() {
        return taille;
    }

    public String getObjectif() {
        return objectif;
    }

    public String getNiveau() {
        return niveau;
    }

    public String getActivite() {
        return activite;
    }

    public LocalDate getDateNaissance() {
        return dateNaissance;
    }
}
