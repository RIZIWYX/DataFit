package com.datafit.backend.seance.cardio;

import com.datafit.backend.utilisateur.Utilisateur;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

// Une seance cardio (course) capturee depuis la montre (simulateur).
// Une ligne = une seance. Plusieurs seances possibles le meme jour.
@Entity
@Table(name = "seance_cardio")
public class Cardio {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "utilisateur_id", nullable = false)
private Utilisateur utilisateur;

@Column(nullable = false, updatable = false)
private LocalDate date;

@Column(nullable = false) private String nom;

@Column(name = "fc_moy", nullable = false) private Integer fcMoy;
@Column(name = "fc_min", nullable = false) private Integer fcMin;
@Column(name = "fc_max", nullable = false) private Integer fcMax;
@Column(name = "correlation_vitesse_fc", nullable = false) private Double correlationVitesseFc;
@Column(name = "duree_s", nullable = false) private Integer dureeS;
@Column(name = "distance_m", nullable = false) private Double distanceM;
@Column(name = "vitesse_moy_kmh", nullable = false) private Double vitesseMoyKmh;
@Column(name = "vitesse_max_kmh", nullable = false) private Double vitesseMaxKmh;
@Column(name = "temps_moy_1km_s", nullable = false) private Double tempsMoy1kmS;
@Column(name = "variation_vitesse", nullable = false) private Double variationVitesse;

protected Cardio() {
  // requis par JPA
}

public Cardio(Utilisateur utilisateur, String nom,
    Integer fcMoy, Integer fcMin, Integer fcMax,
    Double correlationVitesseFc, Integer dureeS, Double distanceM,
    Double vitesseMoyKmh, Double vitesseMaxKmh,
    Double tempsMoy1kmS, Double variationVitesse) {
  this.utilisateur = utilisateur;
  this.nom = nom;
  this.fcMoy = fcMoy;
  this.fcMin = fcMin;
  this.fcMax = fcMax;
  this.correlationVitesseFc = correlationVitesseFc;
  this.dureeS = dureeS;
  this.distanceM = distanceM;
  this.vitesseMoyKmh = vitesseMoyKmh;
  this.vitesseMaxKmh = vitesseMaxKmh;
  this.tempsMoy1kmS = tempsMoy1kmS;
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
public Integer getFcMoy() { return fcMoy; }
public Integer getFcMin() { return fcMin; }
public Integer getFcMax() { return fcMax; }
public Double getCorrelationVitesseFc() { return correlationVitesseFc; }
public Integer getDureeS() { return dureeS; }
public Double getDistanceM() { return distanceM; }
public Double getVitesseMoyKmh() { return vitesseMoyKmh; }
public Double getVitesseMaxKmh() { return vitesseMaxKmh; }
public Double getTempsMoy1kmS() { return tempsMoy1kmS; }
public Double getVariationVitesse() { return variationVitesse; }
}
