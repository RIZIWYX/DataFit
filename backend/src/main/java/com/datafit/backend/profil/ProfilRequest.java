package com.datafit.backend.profil;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

// Ce que la page de création du profil envoie (voir frontend/src/hooks/useCreationProfil.ts)
public record ProfilRequest(

    // l'identifiant renvoyé par l'inscription : le profil appartient à ce compte
    @NotNull(message = "Le compte est obligatoire")
    Long utilisateurId,

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 255)
    @Pattern(regexp = "^[\\p{L} '-]+$", message = "Le nom est invalide")
    String nom,

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 255)
    @Pattern(regexp = "^[\\p{L} '-]+$", message = "Le prénom est invalide")
    String prenom,

    // « H » ou « F »
    @NotBlank(message = "Le sexe est obligatoire")
    @Pattern(regexp = "^[HF]$", message = "Le sexe est invalide")
    String sexe,

    @NotNull(message = "Le poids est obligatoire")
    @Positive(message = "Le poids doit être un nombre positif")
    Double poids,

    @NotNull(message = "La taille est obligatoire")
    @Positive(message = "La taille doit être un nombre positif")
    Double taille,

    @NotBlank(message = "L'objectif est obligatoire")
    @Size(max = 255)
    String objectif,

    @NotBlank(message = "Le niveau est obligatoire")
    @Size(max = 50)
    String niveau,

    // une ou plusieurs activités, séparées par des virgules : « course,natation »
    @NotBlank(message = "L'activité est obligatoire")
    @Size(max = 50)
    String activite,

    @NotNull(message = "La date de naissance est obligatoire")
    @Past(message = "La date de naissance doit être dans le passé")
    LocalDate dateNaissance

) {}
