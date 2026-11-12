package com.datafit.backend.compte;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

// Ce que la page Profil envoie pour « Effacer mes données » : les catégories cochées
// ("seances", "sommeil", "nutrition", "performances") et le mot de passe, comme confirmation
public record EffacementRequest(

    @NotEmpty(message = "Choisissez au moins une catégorie de données")
    Set<CategorieDonnees> categories,

    @NotBlank(message = "Le mot de passe est obligatoire")
    String motDePasse

) {}
