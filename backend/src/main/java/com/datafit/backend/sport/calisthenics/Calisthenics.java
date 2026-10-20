package com.datafit.backend.sport.calisthenics;

import com.datafit.backend.utilisateur.Utilisateur;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

// Une ligne de la table "calisthenics" (voir db/init.sql) :
// un enregistrement des perfs Calisthenics d'un utilisateur.
// Une ligne = une séance = un jour (UNIQUE (utilisateur_id, date)).
// La date est posée à la création et ne change plus, même si on corrige les perfs.
@Entity
@Table(name = "calisthenics")
public class Calisthenics {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "utilisateur_id", nullable = false)
private Utilisateur utilisateur;

// posée automatiquement à la création par @PrePersist ; non modifiable ensuite
@Column(nullable = false, updatable = false)
private LocalDate date;

@Column(name = "traction", nullable = false) private Double traction;
@Column(name = "dip", nullable = false) private Double dip;
@Column(name = "pompe", nullable = false) private Double pompe;
@Column(name = "muscleup", nullable = false) private Double muscleup;
@Column(name = "pistol", nullable = false) private Double pistol;
@Column(name = "l_sit", nullable = false) private Double lSit;
@Column(name = "handstand", nullable = false) private Double handstand;
@Column(name = "front_lever", nullable = false) private Double frontLever;
@Column(name = "oap", nullable = false) private Double oap;
@Column(name = "flag", nullable = false) private Double flag;
@Column(name = "planche", nullable = false) private Double planche;
@Column(name = "crucifix", nullable = false) private Double crucifix;

protected Calisthenics() {
  // Constructeur par défaut requis par JPA
}

public Calisthenics(Utilisateur utilisateur, double traction, double dip, double pompe, double muscleup, double pistol, double lSit, double handstand, double frontLever, double oap, double flag, double planche, double crucifix) {
  this.utilisateur = utilisateur;
  this.traction = traction;
  this.dip = dip;
  this.pompe = pompe;
  this.muscleup = muscleup;
  this.pistol = pistol;
  this.lSit = lSit;
  this.handstand = handstand;
  this.frontLever = frontLever;
  this.oap = oap;
  this.flag = flag;
  this.planche = planche;
  this.crucifix = crucifix;
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

public Double getTraction() {
  return traction;
}

public Double getDip() {
  return dip;
}

public Double getPompe() {
  return pompe;
}

public Double getMuscleup() {
  return muscleup;
}

public Double getPistol() {
  return pistol;
}

public Double getLSit() {
  return lSit;
}

public Double getHandstand() {
  return handstand;
}

public Double getFrontLever() {
  return frontLever;
}

public Double getOap() {
  return oap;
}

public Double getFlag() {
  return flag;
}

public Double getPlanche() {
  return planche;
}

public Double getCrucifix() {
  return crucifix;
}

public void setTraction(Double traction) {
  this.traction = traction;
}

public void setDip(Double dip) {
  this.dip = dip;
}

public void setPompe(Double pompe) {
  this.pompe = pompe;
}

public void setMuscleup(Double muscleup) {
  this.muscleup = muscleup;
}

public void setPistol(Double pistol) {
  this.pistol = pistol;
}

public void setLSit(Double lSit) {
  this.lSit = lSit;
}

public void setHandstand(Double handstand) {
  this.handstand = handstand;
}

public void setFrontLever(Double frontLever) {
  this.frontLever = frontLever;
}

public void setOap(Double oap) {
  this.oap = oap;
}

public void setFlag(Double flag) {
  this.flag = flag;
}

public void setPlanche(Double planche) {
  this.planche = planche;
}

public void setCrucifix(Double crucifix) {
  this.crucifix = crucifix;
}
}
