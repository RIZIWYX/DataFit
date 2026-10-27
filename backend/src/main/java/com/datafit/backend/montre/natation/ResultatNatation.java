package com.datafit.backend.montre.natation;

// Metriques renvoyees par l'analyse pour une seance natation.
public record ResultatNatation(
        Integer fcMin,
        Integer fcMoy,
        Integer fcMax,
        Integer dureeS,
        Double distanceM,
        Double tempsMoy100mS,
        Double dureeLongueurRapideS,
        Double dureeMoyLongueurS,
        Double variationDureeLongueurs,
        Integer totalCyclesBras,
        Integer tempsNageS,
        Integer tempsPauseS) {
}
