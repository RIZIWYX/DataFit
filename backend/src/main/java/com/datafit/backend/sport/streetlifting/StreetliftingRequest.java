package com.datafit.backend.sport.streetlifting;
import jakarta.validation.constraints.Positive;

public record StreetliftingRequest(
    @Positive(message = "La valeur pour traction doit être positive")
    Double traction,

    @Positive(message = "La valeur pour dip doit être positive")
    Double dip,

    @Positive(message = "La valeur pour pompe doit être positive")
    Double pompe,

    @Positive(message = "La valeur pour muscle-up doit être positive")
    Double muscleup
) {
}
