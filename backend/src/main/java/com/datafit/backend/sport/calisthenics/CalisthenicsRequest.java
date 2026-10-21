package com.datafit.backend.sport.calisthenics;
import jakarta.validation.constraints.Positive;

public record CalisthenicsRequest(
    @Positive(message = "La valeur pour traction doit être positive")
    Double traction,

    @Positive(message = "La valeur pour dip doit être positive")
    Double dip,

    @Positive(message = "La valeur pour pompe doit être positive")
    Double pompe,

    @Positive(message = "La valeur pour muscle-up doit être positive")
    Double muscleup,

    @Positive(message = "La valeur pour pistol squat doit être positive")
    Double pistol,

    @Positive(message = "La valeur pour L-sit doit être positive")
    Double lSit,

    @Positive(message = "La valeur pour handstand doit être positive")
    Double handstand,

    @Positive(message = "La valeur pour front lever doit être positive")
    Double frontLever,

    @Positive(message = "La valeur pour one arm pull-up doit être positive")
    Double oap,

    @Positive(message = "La valeur pour human flag doit être positive")
    Double flag,

    @Positive(message = "La valeur pour planche doit être positive")
    Double planche,

    @Positive(message = "La valeur pour crucifix doit être positive")
    Double crucifix
) {
}
