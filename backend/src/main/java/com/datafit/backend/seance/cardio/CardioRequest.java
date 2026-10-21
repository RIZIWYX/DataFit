package com.datafit.backend.seance.cardio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record CardioRequest(
    @NotBlank(message = "Le nom de la seance est obligatoire")
    String nom,

    @Positive(message = "fcMoy doit etre positif") Integer fcMoy,
    @Positive(message = "fcMin doit etre positif") Integer fcMin,
    @Positive(message = "fcMax doit etre positif") Integer fcMax,
    @NotNull(message = "correlationVitesseFc obligatoire") Double correlationVitesseFc,

    @PositiveOrZero(message = "dureeS invalide") Integer dureeS,
    @PositiveOrZero(message = "distanceM invalide") Double distanceM,
    @PositiveOrZero(message = "vitesseMoyKmh invalide") Double vitesseMoyKmh,
    @PositiveOrZero(message = "vitesseMaxKmh invalide") Double vitesseMaxKmh,
    @PositiveOrZero(message = "tempsMoy1kmS invalide") Double tempsMoy1kmS,
    @NotNull(message = "variationVitesse obligatoire") Double variationVitesse) {
}
