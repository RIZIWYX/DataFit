package com.datafit.backend.seance.natation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record NatationRequest(
    @NotBlank(message = "Le nom de la seance est obligatoire")
    String nom,

    @Positive(message = "fcMin doit etre positif") Integer fcMin,
    @Positive(message = "fcMoy doit etre positif") Integer fcMoy,
    @Positive(message = "fcMax doit etre positif") Integer fcMax,

    @PositiveOrZero(message = "dureeS invalide") Integer dureeS,
    @PositiveOrZero(message = "distanceM invalide") Double distanceM,
    @PositiveOrZero(message = "tempsMoy100mS invalide") Double tempsMoy100mS,
    @PositiveOrZero(message = "dureeLongueurRapideS invalide") Double dureeLongueurRapideS,
    @PositiveOrZero(message = "dureeMoyLongueurS invalide") Double dureeMoyLongueurS,
    @NotNull(message = "variationDureeLongueurs obligatoire") Double variationDureeLongueurs,
    @PositiveOrZero(message = "totalCyclesBras invalide") Integer totalCyclesBras,
    @PositiveOrZero(message = "tempsNageS invalide") Integer tempsNageS,
    @PositiveOrZero(message = "tempsPauseS invalide") Integer tempsPauseS) {
}
