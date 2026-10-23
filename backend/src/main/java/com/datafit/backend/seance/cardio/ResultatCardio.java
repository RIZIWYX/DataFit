package com.datafit.backend.seance.cardio;

// Metriques renvoyees par le service d'analyse pour une seance cardio.
// Les noms doivent correspondre aux champs JSON renvoyes par l'analyse
// (ajouter @JsonProperty("...") si l'analyse utilise d'autres noms).
public record ResultatCardio(
    Integer fcMoy,
    Integer fcMin,
    Integer fcMax,
    Double correlationVitesseFc,
    Integer dureeS,
    Double distanceM,
    Double vitesseMoyKmh,
    Double vitesseMaxKmh,
    Double tempsMoy1kmS,
    Double variationVitesse) {
}
