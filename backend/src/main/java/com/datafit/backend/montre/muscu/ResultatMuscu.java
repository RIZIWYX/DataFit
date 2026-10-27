package com.datafit.backend.montre.muscu;

// Metriques renvoyees par l'analyse pour une seance muscu.
public record ResultatMuscu(
        Integer fcMin,
        Integer fcMoy,
        Integer fcMax,
        Integer fcMoyEffort,
        Integer fcMoyPause,
        Integer dureeS,
        Integer dureeEffortS,
        Integer dureePauseS,
        Integer nbSeries,
        Double dureeMoyPauseS,
        Double baisseFcApres60s) {
}
