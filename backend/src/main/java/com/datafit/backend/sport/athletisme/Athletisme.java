package com.datafit.backend.sport.athletisme;

import com.datafit.backend.utilisateur.Utilisateur;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

// Une ligne de la table "athletisme" (voir db/init.sql) :
// un enregistrement des perfs Athletisme d'un utilisateur.
// Une ligne = une séance = un jour (UNIQUE (utilisateur_id, date)).
// La date est posée à la création et ne change plus, même si on corrige les perfs.
@Entity
@Table(name = "athletisme")
public class Athletisme {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "utilisateur_id", nullable = false)
private Utilisateur utilisateur;

// posée automatiquement à la création par @PrePersist ; non modifiable ensuite
@Column(nullable = false, updatable = false)
private LocalDate date;

@Column(name = "m_100", nullable = false) private Double m100;
@Column(name = "m_400", nullable = false) private Double m400;
@Column(name = "m_800", nullable = false) private Double m800;
@Column(name = "m_1500", nullable = false) private Double m1500;
@Column(name = "m_5000", nullable = false) private Double m5000;
@Column(name = "m_10000", nullable = false) private Double m10000;
@Column(name = "semi_marathon", nullable = false) private Double semiMarathon;
@Column(name = "marathon", nullable = false) private Double marathon;
@Column(name = "triathlon", nullable = false) private Double triathlon;
@Column(name = "ironman", nullable = false) private Double ironman;
@Column(name = "longueur", nullable = false) private Double longueur;
@Column(name = "hauteur", nullable = false) private Double hauteur;

protected Athletisme() {
  // Constructeur par défaut requis par JPA
}

public Athletisme(Utilisateur utilisateur, double m100, double m400, double m800, double m1500, double m5000, double m10000, double semiMarathon, double marathon, double triathlon, double ironman, double longueur, double hauteur) {
  this.utilisateur = utilisateur;
  this.m100 = m100;
  this.m400 = m400;
  this.m800 = m800;
  this.m1500 = m1500;
  this.m5000 = m5000;
  this.m10000 = m10000;
  this.semiMarathon = semiMarathon;
  this.marathon = marathon;
  this.triathlon = triathlon;
  this.ironman = ironman;
  this.longueur = longueur;
  this.hauteur = hauteur;
}

// Hibernate appelle cette méthode juste avant l'INSERT en base
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

public Double getM100() {
  return m100;
}

public Double getM400() {
  return m400;
}

public Double getM800() {
  return m800;
}

public Double getM1500() {
  return m1500;
}

public Double getM5000() {
  return m5000;
}

public Double getM10000() {
  return m10000;
}

public Double getSemiMarathon() {
  return semiMarathon;
}

public Double getMarathon() {
  return marathon;
}

public Double getTriathlon() {
  return triathlon;
}

public Double getIronman() {
  return ironman;
}

public Double getLongueur() {
  return longueur;
}

public Double getHauteur() {
  return hauteur;
}

public void setM100(Double m100) {
  this.m100 = m100;
}

public void setM400(Double m400) {
  this.m400 = m400;
}

public void setM800(Double m800) {
  this.m800 = m800;
}

public void setM1500(Double m1500) {
  this.m1500 = m1500;
}

public void setM5000(Double m5000) {
  this.m5000 = m5000;
}

public void setM10000(Double m10000) {
  this.m10000 = m10000;
}

public void setSemiMarathon(Double semiMarathon) {
  this.semiMarathon = semiMarathon;
}

public void setMarathon(Double marathon) {
  this.marathon = marathon;
}

public void setTriathlon(Double triathlon) {
  this.triathlon = triathlon;
}

public void setIronman(Double ironman) {
  this.ironman = ironman;
}

public void setLongueur(Double longueur) {
  this.longueur = longueur;
}

public void setHauteur(Double hauteur) {
  this.hauteur = hauteur;
}
}
