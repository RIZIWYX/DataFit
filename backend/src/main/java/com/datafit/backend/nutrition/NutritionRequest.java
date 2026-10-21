package com.datafit.backend.nutrition;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

// Ce que la page Nutrition envoie pour la journée (boutons « Valider » et « Modifier »).
// @PositiveOrZero seul laisse passer une valeur absente : @NotNull la refuse avant qu'elle n'atteigne la base.
// 0 kcal est possible : la journée revient à zéro quand on supprime tous ses repas.
public record NutritionRequest(
        @NotNull(message = "Les calories sont obligatoires")
        @PositiveOrZero(message = "La valeur pour les calories ne peut pas être négative")
        Double calories,

        // 0 g est possible pour un macronutriment : seules les valeurs négatives sont refusées
        @NotNull(message = "Les protéines sont obligatoires")
        @PositiveOrZero(message = "La valeur pour les protéines ne peut pas être négative")
        Double proteines,

        @NotNull(message = "Les glucides sont obligatoires")
        @PositiveOrZero(message = "La valeur pour les glucides ne peut pas être négative")
        Double glucides,

        @NotNull(message = "Les lipides sont obligatoires")
        @PositiveOrZero(message = "La valeur pour les lipides ne peut pas être négative")
        Double lipides,

        @NotBlank(message = "L'objectif est obligatoire")
        @Size(max = 255)
        String objectif) {
}
