package com.datafit.backend.sport.halterofilie;

import com.datafit.backend.utilisateur.Utilisateur;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

// Une ligne de la table "halterofilie" (voir db/init.sql) :
// un enregistrement des perfs Halterofilie d'un utilisateur.
// Une ligne = une séance = un jour (UNIQUE (utilisateur_id, date)).
// La date est posée à la création et ne change plus, même si on corrige les perfs.
@Entity
@Table(name = "halterofilie")
public class Halterofilie {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "utilisateur_id", nullable = false)
private Utilisateur utilisateur;

// posée automatiquement à la création par @PrePersist ; non modifiable ensuite
@Column(nullable = false, updatable = false)
private LocalDate date;

@Column(name = "aracher", nullable = false) private Double aracher;
@Column(name = "epolejette", nullable = false) private Double epolejette;

protected Halterofilie() {
  // Constructeur par défaut requis par JPA
}

public Halterofilie(Utilisateur utilisateur, double aracher, double epolejette) {
  this.utilisateur = utilisateur;
  this.aracher = aracher;
  this.epolejette = epolejette;
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

public Double getAracher() {
  return aracher;
}

public Double getEpolejette() {
  return epolejette;
}

public void setAracher(Double aracher) {
  this.aracher = aracher;
}

public void setEpolejette(Double epolejette) {
  this.epolejette = epolejette;
}
}
