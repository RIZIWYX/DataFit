package com.datafit.backend.seance.muscu;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

// Donnees d'une seance muscu.
// Note : a terme ces valeurs viendront de l'analyse (AnalyseClient),
// pas du corps de la requete. En attendant on les recoit ici.
public record MuscuRequest(
    @NotBlank(message = "Le nom de la seance est obligatoire")
    String nom,

    @Positive(message = "fcMin doit etre positif") Integer fcMin,
    @Positive(message = "fcMoy doit etre positif") Integer fcMoy,
    @Positive(message = "fcMax doit etre positif") Integer fcMax,
    @Positive(message = "fcMoyEffort doit etre positif") Integer fcMoyEffort,
    @Positive(message = "fcMoyPause doit etre positif") Integer fcMoyPause,

    @PositiveOrZero(message = "dureeS invalide") Integer dureeS,
    @PositiveOrZero(message = "dureeEffortS invalide") Integer dureeEffortS,
    @PositiveOrZero(message = "dureePauseS invalide") Integer dureePauseS,
    @PositiveOrZero(message = "nbSeries invalide") Integer nbSeries,
    @PositiveOrZero(message = "dureeMoyPauseS invalide") Double dureeMoyPauseS,

    @NotNull(message = "baisseFcApres60s obligatoire") Double baisseFcApres60s) {
}
