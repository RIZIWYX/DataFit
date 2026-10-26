package com.datafit.backend.sommeil;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

// Ce que la page Nutrition envoie pour chaque repas noté.
// @PositiveOrZero seul laisse passer une valeur absente : @NotNull la refuse avant qu'elle n'atteigne la base.
// 0 kcal est possible (un café, de l'eau…).
public record SommeilRequest(
        // le jour du repas, au format AAAA-MM-JJ
        @NotNull(message = "La date est obligatoire") LocalDate date,

        // mêmes valeurs que REPAS dans frontend/src/lib/nutrition.ts
        @NotBlank(message = "Le moment du repas est obligatoire") @Pattern(regexp = "petit-dejeuner|dejeuner|diner|collation", message = "Le moment du repas doit être petit-dejeuner, dejeuner, diner ou collation") String repas,

        @NotBlank(message = "Le nom est obligatoire") @Size(max = 255) String nom,

        @NotNull(message = "Les calories sont obligatoires") @PositiveOrZero(message = "La valeur pour les calories ne peut pas être négative") Double calories,

        // 0 g est possible pour un macronutriment : seules les valeurs négatives sont
        // refusées
        @NotNull(message = "Les protéines sont obligatoires") @PositiveOrZero(message = "La valeur pour les protéines ne peut pas être négative") Double proteines,

        @NotNull(message = "Les glucides sont obligatoires") @PositiveOrZero(message = "La valeur pour les glucides ne peut pas être négative") Double glucides,

        @NotNull(message = "Les lipides sont obligatoires") @PositiveOrZero(message = "La valeur pour les lipides ne peut pas être négative") Double lipides,

        @NotBlank(message = "L'objectif est obligatoire") @Size(max = 255) String objectif) {
}
