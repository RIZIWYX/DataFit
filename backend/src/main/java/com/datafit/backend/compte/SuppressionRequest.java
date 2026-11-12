package com.datafit.backend.compte;

import jakarta.validation.constraints.NotBlank;

// Ce que la page Profil envoie pour supprimer le compte : le mot de passe, comme confirmation
public record SuppressionRequest(

    @NotBlank(message = "Le mot de passe est obligatoire")
    String motDePasse

) {}
