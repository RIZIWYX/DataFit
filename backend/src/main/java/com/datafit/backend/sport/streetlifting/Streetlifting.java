package com.datafit.backend.sport.streetlifting;

import com.datafit.backend.utilisateur.Utilisateur;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

// Une ligne de la table "streetlifting" (voir db/init.sql) :
// un enregistrement des perfs Streetlifting d'un utilisateur.
// Une ligne = une séance = un jour (UNIQUE (utilisateur_id, date)).
// La date est posée à la création et ne change plus, même si on corrige les perfs.
@Entity
@Table(name = "streetlifting")
public class Streetlifting {
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

protected Streetlifting() {
  // Constructeur par défaut requis par JPA
}

public Streetlifting(Utilisateur utilisateur, double traction, double dip, double pompe, double muscleup) {
  this.utilisateur = utilisateur;
  this.traction = traction;
  this.dip = dip;
  this.pompe = pompe;
  this.muscleup = muscleup;
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
}
