package com.datafit.backend.profil;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

// Ce que la page Profil envoie pour modifier le profil (PUT /api/profil/{utilisateurId}).
// Le compte est dans l'URL : il n'est pas répété ici.
public record ProfilModificationRequest(

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
    @DecimalMin(value = "30", message = "Le poids doit être compris entre 30 et 250 kg")
    @DecimalMax(value = "250", message = "Le poids doit être compris entre 30 et 250 kg")
    Double poids,

    @NotNull(message = "La taille est obligatoire")
    @DecimalMin(value = "100", message = "La taille doit être comprise entre 100 et 250 cm")
    @DecimalMax(value = "250", message = "La taille doit être comprise entre 100 et 250 cm")
    Double taille,

    @NotBlank(message = "L'objectif est obligatoire")
    @Size(max = 255)
    String objectif,

    // les valeurs acceptées par le simulateur de la montre
    @NotBlank(message = "Le niveau est obligatoire")
    @Pattern(regexp = "^(novice|intermediaire|confirmer)$",
        message = "Le niveau doit être novice, intermediaire ou confirmer")
    String niveau,

    // une ou plusieurs activités, séparées par des virgules : « course,natation »
    @NotBlank(message = "Choisissez au moins une activité")
    @Size(max = 50, message = "Trop d'activités choisies")
    String activite,

    @NotNull(message = "La date de naissance est obligatoire")
    @Past(message = "La date de naissance doit être dans le passé")
    LocalDate dateNaissance

) {}
