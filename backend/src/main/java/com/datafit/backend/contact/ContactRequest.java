package com.datafit.backend.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Ce que le formulaire de contact envoie
public record ContactRequest(

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom est trop long")
    String nom,

    @NotBlank(message = "L'adresse e-mail est obligatoire")
    @Email(message = "L'adresse e-mail est invalide")
    @Size(max = 255)
    String email,

    @NotBlank(message = "Le sujet est obligatoire")
    @Pattern(regexp = "question|probleme|donnees|autre", message = "Le sujet est invalide")
    String sujet,

    @NotBlank(message = "Le message est obligatoire")
    @Size(max = 2000, message = "Le message ne doit pas dépasser 2000 caractères")
    String message

) {}
