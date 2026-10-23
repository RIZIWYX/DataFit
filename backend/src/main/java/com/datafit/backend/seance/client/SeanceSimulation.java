package com.datafit.backend.seance.client;

import java.time.LocalDate;

// Description de la seance envoyee au simulateur (modele Pydantic "Seance").
public record SeanceSimulation(
    String type,          // "cardio" / "natation" / "muscu" / "velo"
    String nom,
    LocalDate date) {
}
