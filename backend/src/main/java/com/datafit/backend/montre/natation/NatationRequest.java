package com.datafit.backend.montre.natation;

import jakarta.validation.constraints.NotBlank;

// Ce que le front envoie pour lancer une seance natation.
// Le reste (profil, metriques) vient du profil en base et de l'analyse.
public record NatationRequest(
        @NotBlank(message = "Le nom de la seance est obligatoire") String nom) {
}
