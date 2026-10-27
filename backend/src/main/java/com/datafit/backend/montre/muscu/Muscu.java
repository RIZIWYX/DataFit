package com.datafit.backend.montre.muscu;

import com.datafit.backend.utilisateur.Utilisateur;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

// Une seance de musculation capturee depuis la montre (simulateur).
// Une ligne = une seance. Plusieurs seances possibles le meme jour.
@Entity
@Table(name = "seance_muscu")
public class Muscu {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "utilisateur_id", nullable = false)
  private Utilisateur utilisateur;

  @Column(nullable = false, updatable = false)
  private LocalDate date;

  @Column(nullable = false)
  private String nom;

  @Column(name = "fc_min", nullable = false)
  private Integer fcMin;
  @Column(name = "fc_moy", nullable = false)
  private Integer fcMoy;
  @Column(name = "fc_max", nullable = false)
  private Integer fcMax;
  @Column(name = "fc_moy_effort", nullable = false)
  private Integer fcMoyEffort;
  @Column(name = "fc_moy_pause", nullable = false)
  private Integer fcMoyPause;
  @Column(name = "duree_s", nullable = false)
  private Integer dureeS;
  @Column(name = "duree_effort_s", nullable = false)
  private Integer dureeEffortS;
  @Column(name = "duree_pause_s", nullable = false)
  private Integer dureePauseS;
  @Column(name = "nb_series", nullable = false)
  private Integer nbSeries;
  @Column(name = "duree_moy_pause_s", nullable = false)
  private Double dureeMoyPauseS;
  @Column(name = "baisse_fc_apres_60s", nullable = false)
  private Double baisseFcApres60s;

  protected Muscu() {
    // requis par JPA
  }

  public Muscu(Utilisateur utilisateur, String nom,
      Integer fcMin, Integer fcMoy, Integer fcMax,
      Integer fcMoyEffort, Integer fcMoyPause,
      Integer dureeS, Integer dureeEffortS, Integer dureePauseS,
      Integer nbSeries, Double dureeMoyPauseS, Double baisseFcApres60s) {
    this.utilisateur = utilisateur;
    this.nom = nom;
    this.fcMin = fcMin;
    this.fcMoy = fcMoy;
    this.fcMax = fcMax;
    this.fcMoyEffort = fcMoyEffort;
    this.fcMoyPause = fcMoyPause;
    this.dureeS = dureeS;
    this.dureeEffortS = dureeEffortS;
    this.dureePauseS = dureePauseS;
    this.nbSeries = nbSeries;
    this.dureeMoyPauseS = dureeMoyPauseS;
    this.baisseFcApres60s = baisseFcApres60s;
  }

  @PrePersist
  protected void avantCreation() {
    this.date = LocalDate.now();
  }

  public Long getId() {
    return id;
  }

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

  public Integer getFcMin() {
    return fcMin;
  }

  public Integer getFcMoy() {
    return fcMoy;
  }

  public Integer getFcMax() {
    return fcMax;
  }

  public Integer getFcMoyEffort() {
    return fcMoyEffort;
  }

  public Integer getFcMoyPause() {
    return fcMoyPause;
  }

  public Integer getDureeS() {
    return dureeS;
  }

  public Integer getDureeEffortS() {
    return dureeEffortS;
  }

  public Integer getDureePauseS() {
    return dureePauseS;
  }

  public Integer getNbSeries() {
    return nbSeries;
  }

  public Double getDureeMoyPauseS() {
    return dureeMoyPauseS;
  }

  public Double getBaisseFcApres60s() {
    return baisseFcApres60s;
  }
}
