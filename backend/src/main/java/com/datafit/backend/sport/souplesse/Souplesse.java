package com.datafit.backend.sport.souplesse;

import com.datafit.backend.utilisateur.Utilisateur;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

// Une ligne de la table "souplesse" (voir db/init.sql) :
// un enregistrement des perfs Souplesse d'un utilisateur.
// Une ligne = une séance = un jour (UNIQUE (utilisateur_id, date)).
// La date est posée à la création et ne change plus, même si on corrige les perfs.
@Entity
@Table(name = "souplesse")
public class Souplesse {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "utilisateur_id", nullable = false)
private Utilisateur utilisateur;

// posée automatiquement à la création par @PrePersist ; non modifiable ensuite
@Column(nullable = false, updatable = false)
private LocalDate date;

@Column(name = "facial", nullable = false) private Double facial;
@Column(name = "anteropost", nullable = false) private Double anteropost;
@Column(name = "todebout", nullable = false) private Double todebout;
@Column(name = "toassis", nullable = false) private Double toassis;

protected Souplesse() {
  // Constructeur par défaut requis par JPA
}

public Souplesse(Utilisateur utilisateur, double facial, double anteropost, double todebout, double toassis) {
  this.utilisateur = utilisateur;
  this.facial = facial;
  this.anteropost = anteropost;
  this.todebout = todebout;
  this.toassis = toassis;
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

public Double getFacial() {
  return facial;
}

public Double getAnteropost() {
  return anteropost;
}

public Double getTodebout() {
  return todebout;
}

public Double getToassis() {
  return toassis;
}

public void setFacial(Double facial) {
  this.facial = facial;
}

public void setAnteropost(Double anteropost) {
  this.anteropost = anteropost;
}

public void setTodebout(Double todebout) {
  this.todebout = todebout;
}

public void setToassis(Double toassis) {
  this.toassis = toassis;
}
}
