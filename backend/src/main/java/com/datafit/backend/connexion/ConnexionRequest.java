package com.datafit.backend.connexion;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Ce que le formulaire de connexion envoie : l'e-mail et le mot de passe, rien d'autre
// (l'identifiant du compte, on ne le connaît pas encore : c'est la connexion qui le renvoie)
public record ConnexionRequest(

    @NotBlank(message = "L'adresse e-mail est obligatoire")
    @Email(message = "L'adresse e-mail est invalide")
    @Size(max = 255)
    String email,

    // pas de longueur minimale ici : la règle des 8 caractères s'applique à l'inscription,
    // à la connexion on vérifie seulement que le mot de passe correspond
    @NotBlank(message = "Le mot de passe est obligatoire")
    String password

) {}
