package com.datafit.backend.sport.sbd;

import com.datafit.backend.utilisateur.Utilisateur;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

// Une ligne de la table "sbd" (voir db/init.sql) :
// un enregistrement des perfs Bench/Squat/Deadlift d'un utilisateur.
// La date est automatiquement celle du jour de création ou de modification.
@Entity
@Table(name = "sbd")
public class SBD {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "utilisateur_id", nullable = false)
private Utilisateur utilisateur;

// mise à jour automatiquement par @PrePersist / @PreUpdate
@Column(nullable = false)
private LocalDate date;

@Column(nullable = false) private Double bench;
@Column(nullable = false) private Double squat;
@Column(nullable = false) private Double deadlift;

protected SBD() {
  // Constructeur par défaut requis par JPA
}

public SBD(Utilisateur utilisateur, double bench, double squat,
    double deadlift) {
  this.utilisateur = utilisateur;
  this.bench = bench;
  this.squat = squat;
  this.deadlift = deadlift;
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

public Double getBench() {
  return bench;
}

public Double getSquat() {
  return squat;
}

public Double getDeadlift() {
  return deadlift;
}

public void setBench(Double bench) {
  this.bench = bench;
}

public void setSquat(Double squat) {
  this.squat = squat;
}

public void setDeadlift(Double deadlift) {
  this.deadlift = deadlift;
}
}
