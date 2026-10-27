package com.datafit.backend.montre.muscu;

import jakarta.validation.constraints.NotBlank;

// Ce que le front envoie pour lancer une seance muscu.
// Le reste (profil, metriques) vient du profil en base et de l'analyse.
public record MuscuRequest(
        @NotBlank(message = "Le nom de la seance est obligatoire") String nom) {
}
