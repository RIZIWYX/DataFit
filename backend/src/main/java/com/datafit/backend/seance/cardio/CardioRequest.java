package com.datafit.backend.seance.cardio;

import jakarta.validation.constraints.NotBlank;

// Ce que le front envoie pour lancer une seance cardio.
// Le reste (profil, metriques) vient du profil en base et de l'analyse.
public record CardioRequest(
    @NotBlank(message = "Le nom de la seance est obligatoire")
    String nom) {
}
