package com.datafit.backend.compte;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Ce que la page Profil envoie pour changer le mot de passe.
// motDePasseActuel est vide pour un compte Google qui n'a pas encore de mot de passe.
public record MotDePasseRequest(

    String motDePasseActuel,

    // 72 au plus : BCrypt ignore ce qui dépasse 72 octets
    @NotBlank(message = "Le nouveau mot de passe est obligatoire")
    @Size(min = 8, max = 72, message = "Le mot de passe doit contenir entre 8 et 72 caractères")
    String nouveauMotDePasse

) {}
