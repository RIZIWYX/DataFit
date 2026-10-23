package com.datafit.backend.seance.velo;

import com.datafit.backend.utilisateur.Utilisateur;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

// Une seance de velo capturee depuis la montre (simulateur).
// Une ligne = une seance. Plusieurs seances possibles le meme jour.
@Entity
@Table(name = "seance_velo")
public class Velo {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "utilisateur_id", nullable = false)
private Utilisateur utilisateur;

@Column(nullable = false, updatable = false)
private LocalDate date;

@Column(nullable = false) private String nom;

@Column(name = "fc_min", nullable = false) private Integer fcMin;
@Column(name = "fc_moy", nullable = false) private Integer fcMoy;
@Column(name = "fc_max", nullable = false) private Integer fcMax;
@Column(name = "correlation_fc_vitesse", nullable = false) private Double correlationFcVitesse;
@Column(name = "duree_s", nullable = false) private Integer dureeS;
@Column(name = "temps_pedalage_s", nullable = false) private Integer tempsPedalageS;
@Column(name = "temps_roue_libre_s", nullable = false) private Integer tempsRoueLibreS;
@Column(name = "temps_pause_s", nullable = false) private Integer tempsPauseS;
@Column(name = "distance_m", nullable = false) private Double distanceM;
@Column(name = "vitesse_moy_kmh", nullable = false) private Double vitesseMoyKmh;
@Column(name = "vitesse_max_kmh", nullable = false) private Double vitesseMaxKmh;
@Column(name = "variation_vitesse", nullable = false) private Double variationVitesse;

protected Velo() {
  // requis par JPA
}

public Velo(Utilisateur utilisateur, String nom,
    Integer fcMin, Integer fcMoy, Integer fcMax,
    Double correlationFcVitesse, Integer dureeS,
    Integer tempsPedalageS, Integer tempsRoueLibreS, Integer tempsPauseS,
    Double distanceM, Double vitesseMoyKmh, Double vitesseMaxKmh,
    Double variationVitesse) {
  this.utilisateur = utilisateur;
  this.nom = nom;
  this.fcMin = fcMin;
  this.fcMoy = fcMoy;
  this.fcMax = fcMax;
  this.correlationFcVitesse = correlationFcVitesse;
  this.dureeS = dureeS;
  this.tempsPedalageS = tempsPedalageS;
  this.tempsRoueLibreS = tempsRoueLibreS;
  this.tempsPauseS = tempsPauseS;
  this.distanceM = distanceM;
  this.vitesseMoyKmh = vitesseMoyKmh;
  this.vitesseMaxKmh = vitesseMaxKmh;
  this.variationVitesse = variationVitesse;
}

@PrePersist
protected void avantCreation() {
  this.date = LocalDate.now();
}

public Long getId() { return id; }
@JsonIgnore public Utilisateur getUtilisateur() { return utilisateur; }
public LocalDate getDate() { return date; }
public String getNom() { return nom; }
public Integer getFcMin() { return fcMin; }
public Integer getFcMoy() { return fcMoy; }
public Integer getFcMax() { return fcMax; }
public Double getCorrelationFcVitesse() { return correlationFcVitesse; }
public Integer getDureeS() { return dureeS; }
public Integer getTempsPedalageS() { return tempsPedalageS; }
public Integer getTempsRoueLibreS() { return tempsRoueLibreS; }
public Integer getTempsPauseS() { return tempsPauseS; }
public Double getDistanceM() { return distanceM; }
public Double getVitesseMoyKmh() { return vitesseMoyKmh; }
public Double getVitesseMaxKmh() { return vitesseMaxKmh; }
public Double getVariationVitesse() { return variationVitesse; }
}
