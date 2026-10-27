package com.datafit.backend.montre.sommeil;

import com.datafit.backend.utilisateur.Utilisateur;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

// Une nuit (table sommeil, db/07_sommeil.sql). Durées en secondes, FC en bpm.
@Entity
@Table(name = "sommeil")
public class Sommeil {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "heure_coucher", nullable = false)
    private LocalDateTime heureCoucher;

    @Column(name = "heure_reveil", nullable = false)
    private LocalDateTime heureReveil;

    @Column(name = "temps_au_lit_s", nullable = false)
    private int tempsAuLitS;

    @Column(name = "duree_sommeil_s", nullable = false)
    private int dureeSommeilS;

    @Column(name = "latence_endormissement_s", nullable = false)
    private int latenceEndormissementS;

    @Column(name = "duree_eveil_totale_s", nullable = false)
    private int dureeEveilTotaleS;

    @Column(name = "eveil_nocturne_s", nullable = false)
    private int eveilNocturneS;

    @Column(name = "reveils_nb", nullable = false)
    private int reveilsNb;

    @Column(name = "efficacite_sommeil_pct", nullable = false)
    private double efficaciteSommeilPct;

    @Column(name = "fc_moyenne", nullable = false)
    private double fcMoyenne;

    @Column(name = "fc_min", nullable = false)
    private double fcMin;

    @Column(name = "fc_max", nullable = false)
    private double fcMax;

    @Column(name = "duree_eveil_s", nullable = false)
    private int dureeEveilS;

    @Column(name = "duree_leger_s", nullable = false)
    private int dureeLegerS;

    @Column(name = "duree_profond_s", nullable = false)
    private int dureeProfondS;

    @Column(name = "duree_paradoxal_s", nullable = false)
    private int dureeParadoxalS;

    protected Sommeil() {
        // Constructeur par défaut requis par JPA
    }

    public Sommeil(Utilisateur utilisateur, SommeilRequest req) {
        this.utilisateur = utilisateur;
        this.heureCoucher = req.heureCoucher();
        this.heureReveil = req.heureReveil();
        this.tempsAuLitS = req.tempsAuLitS();
        this.dureeSommeilS = req.dureeSommeilS();
        this.latenceEndormissementS = req.latenceEndormissementS();
        this.dureeEveilTotaleS = req.dureeEveilTotaleS();
        this.eveilNocturneS = req.eveilNocturneS();
        this.reveilsNb = req.reveilsNb();
        this.efficaciteSommeilPct = req.efficaciteSommeilPct();
        this.fcMoyenne = req.fcMoyenne();
        this.fcMin = req.fcMin();
        this.fcMax = req.fcMax();
        this.dureeEveilS = req.dureeEveilS();
        this.dureeLegerS = req.dureeLegerS();
        this.dureeProfondS = req.dureeProfondS();
        this.dureeParadoxalS = req.dureeParadoxalS();
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

    public LocalDateTime getHeureCoucher() {
        return heureCoucher;
    }

    public LocalDateTime getHeureReveil() {
        return heureReveil;
    }

    public int getTempsAuLitS() {
        return tempsAuLitS;
    }

    public int getDureeSommeilS() {
        return dureeSommeilS;
    }

    public int getLatenceEndormissementS() {
        return latenceEndormissementS;
    }

    public int getDureeEveilTotaleS() {
        return dureeEveilTotaleS;
    }

    public int getEveilNocturneS() {
        return eveilNocturneS;
    }

    public int getReveilsNb() {
        return reveilsNb;
    }

    public double getEfficaciteSommeilPct() {
        return efficaciteSommeilPct;
    }

    public double getFcMoyenne() {
        return fcMoyenne;
    }

    public double getFcMin() {
        return fcMin;
    }

    public double getFcMax() {
        return fcMax;
    }

    public int getDureeEveilS() {
        return dureeEveilS;
    }

    public int getDureeLegerS() {
        return dureeLegerS;
    }

    public int getDureeProfondS() {
        return dureeProfondS;
    }

    public int getDureeParadoxalS() {
        return dureeParadoxalS;
    }
}
