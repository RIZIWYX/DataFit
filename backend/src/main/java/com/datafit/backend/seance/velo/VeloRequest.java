package com.datafit.backend.seance.velo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record VeloRequest(
    @NotBlank(message = "Le nom de la seance est obligatoire")
    String nom,

    @Positive(message = "fcMin doit etre positif") Integer fcMin,
    @Positive(message = "fcMoy doit etre positif") Integer fcMoy,
    @Positive(message = "fcMax doit etre positif") Integer fcMax,
    @NotNull(message = "correlationFcVitesse obligatoire") Double correlationFcVitesse,

    @PositiveOrZero(message = "dureeS invalide") Integer dureeS,
    @PositiveOrZero(message = "tempsPedalageS invalide") Integer tempsPedalageS,
    @PositiveOrZero(message = "tempsRoueLibreS invalide") Integer tempsRoueLibreS,
    @PositiveOrZero(message = "tempsPauseS invalide") Integer tempsPauseS,
    @PositiveOrZero(message = "distanceM invalide") Double distanceM,
    @PositiveOrZero(message = "vitesseMoyKmh invalide") Double vitesseMoyKmh,
    @PositiveOrZero(message = "vitesseMaxKmh invalide") Double vitesseMaxKmh,
    @NotNull(message = "variationVitesse obligatoire") Double variationVitesse) {
}
