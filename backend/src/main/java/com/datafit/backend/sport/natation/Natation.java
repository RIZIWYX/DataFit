package com.datafit.backend.sport.natation;

import com.datafit.backend.utilisateur.Utilisateur;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

// Une ligne de la table "natation" (voir db/init.sql) :
// un enregistrement des perfs Natation d'un utilisateur.
// Une ligne = une séance = un jour (UNIQUE (utilisateur_id, date)).
// La date est posée à la création et ne change plus, même si on corrige les perfs.
@Entity
@Table(name = "natation")
public class Natation {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "utilisateur_id", nullable = false)
private Utilisateur utilisateur;

// posée automatiquement à la création par @PrePersist ; non modifiable ensuite
@Column(nullable = false, updatable = false)
private LocalDate date;

@Column(name = "crawl", nullable = false) private Double crawl;
@Column(name = "dos", nullable = false) private Double dos;
@Column(name = "brassee", nullable = false) private Double brassee;
@Column(name = "papillon", nullable = false) private Double papillon;

protected Natation() {
  // Constructeur par défaut requis par JPA
}

public Natation(Utilisateur utilisateur, double crawl, double dos, double brassee, double papillon) {
  this.utilisateur = utilisateur;
  this.crawl = crawl;
  this.dos = dos;
  this.brassee = brassee;
  this.papillon = papillon;
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

public Double getCrawl() {
  return crawl;
}

public Double getDos() {
  return dos;
}

public Double getBrassee() {
  return brassee;
}

public Double getPapillon() {
  return papillon;
}

public void setCrawl(Double crawl) {
  this.crawl = crawl;
}

public void setDos(Double dos) {
  this.dos = dos;
}

public void setBrassee(Double brassee) {
  this.brassee = brassee;
}

public void setPapillon(Double papillon) {
  this.papillon = papillon;
}
}
