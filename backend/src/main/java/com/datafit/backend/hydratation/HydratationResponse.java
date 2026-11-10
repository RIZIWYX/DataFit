package com.datafit.backend.hydratation;

import java.time.LocalDate;

// Ce que l'API renvoie pour un ajout d'eau : { id, date, ml }
public record HydratationResponse(Long id, LocalDate date, int ml) {

    public static HydratationResponse depuis(Hydratation ajout) {
        return new HydratationResponse(ajout.getId(), ajout.getDate(), ajout.getMl());
    }
}
