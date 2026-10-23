package com.datafit.backend.seance.natation;

import com.datafit.backend.utilisateur.Utilisateur;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

// Une seance de natation capturee depuis la montre (simulateur).
// name = "SeanceNatation" pour ne pas entrer en conflit avec l'entite
// sport.natation.Natation (meme nom court de classe).
@Entity(name = "SeanceNatation")
@Table(name = "seance_natation")
public class Natation {

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
@Column(name = "duree_s", nullable = false) private Integer dureeS;
@Column(name = "distance_m", nullable = false) private Double distanceM;
@Column(name = "temps_moy_100m_s", nullable = false) private Double tempsMoy100mS;
@Column(name = "duree_longueur_rapide_s", nullable = false) private Double dureeLongueurRapideS;
@Column(name = "duree_moy_longueur_s", nullable = false) private Double dureeMoyLongueurS;
@Column(name = "variation_duree_longueurs", nullable = false) private Double variationDureeLongueurs;
@Column(name = "total_cycles_bras", nullable = false) private Integer totalCyclesBras;
@Column(name = "temps_nage_s", nullable = false) private Integer tempsNageS;
@Column(name = "temps_pause_s", nullable = false) private Integer tempsPauseS;

protected Natation() {
  // requis par JPA
}

public Natation(Utilisateur utilisateur, String nom,
    Integer fcMin, Integer fcMoy, Integer fcMax,
    Integer dureeS, Double distanceM, Double tempsMoy100mS,
    Double dureeLongueurRapideS, Double dureeMoyLongueurS,
    Double variationDureeLongueurs, Integer totalCyclesBras,
    Integer tempsNageS, Integer tempsPauseS) {
  this.utilisateur = utilisateur;
  this.nom = nom;
  this.fcMin = fcMin;
  this.fcMoy = fcMoy;
  this.fcMax = fcMax;
  this.dureeS = dureeS;
  this.distanceM = distanceM;
  this.tempsMoy100mS = tempsMoy100mS;
  this.dureeLongueurRapideS = dureeLongueurRapideS;
  this.dureeMoyLongueurS = dureeMoyLongueurS;
  this.variationDureeLongueurs = variationDureeLongueurs;
  this.totalCyclesBras = totalCyclesBras;
  this.tempsNageS = tempsNageS;
  this.tempsPauseS = tempsPauseS;
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
public Integer getDureeS() { return dureeS; }
public Double getDistanceM() { return distanceM; }
public Double getTempsMoy100mS() { return tempsMoy100mS; }
public Double getDureeLongueurRapideS() { return dureeLongueurRapideS; }
public Double getDureeMoyLongueurS() { return dureeMoyLongueurS; }
public Double getVariationDureeLongueurs() { return variationDureeLongueurs; }
public Integer getTotalCyclesBras() { return totalCyclesBras; }
public Integer getTempsNageS() { return tempsNageS; }
public Integer getTempsPauseS() { return tempsPauseS; }
}
