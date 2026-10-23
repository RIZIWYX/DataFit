package com.datafit.backend.seance.velo;

// Metriques renvoyees par l'analyse pour une seance velo.
public record ResultatVelo(
    Integer fcMin,
    Integer fcMoy,
    Integer fcMax,
    Double correlationFcVitesse,
    Integer dureeS,
    Integer tempsPedalageS,
    Integer tempsRoueLibreS,
    Integer tempsPauseS,
    Double distanceM,
    Double vitesseMoyKmh,
    Double vitesseMaxKmh,
    Double variationVitesse) {
}
