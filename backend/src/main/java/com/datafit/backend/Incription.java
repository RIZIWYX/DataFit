package com.datafit.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Une entité = une classe Java qui correspond à une table.
// Un objet Utilisateur = une ligne de la table "utilisateur" (voir
// db/init.sql).
@Entity
@Table(name = "utilisateur")
public class Utilisateur {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY) // l'id est choisi par
                                                    // PostgreSQL (SERIAL)
private Integer id;

@Column(nullable = false, unique = true)
private String email;

@Column(name = "mot_de_passe", nullable = false)
private String motDePasse; // contient l'empreinte BCrypt, jamais le mot de
                           // passe en clair

@Column(name = "cree_le", insertable = false, updatable = false) // rempli par
                                                                 // la base
                                                                 // (DEFAULT
                                                                 // now())
private LocalDateTime creeLe;

protected Utilisateur() {
  // constructeur vide obligatoire pour JPA
}

public Utilisateur(String email, String motDePasse) {
  this.email = email;
  this.motDePasse = motDePasse;
}

public Integer getId() {
  return id;
}

public String getEmail() {
  return email;
}

public String getMotDePasse() {
  return motDePasse;
}

public LocalDateTime getCreeLe() {
  return creeLe;
}
}
