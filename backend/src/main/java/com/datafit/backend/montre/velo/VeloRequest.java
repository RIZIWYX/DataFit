package com.datafit.backend.montre.velo;

import jakarta.validation.constraints.NotBlank;

// Ce que le front envoie pour lancer une seance velo.
// Le reste (profil, metriques) vient du profil en base et de l'analyse.
public record VeloRequest(
        @NotBlank(message = "Le nom de la seance est obligatoire") String nom) {
}
