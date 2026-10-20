package com.datafit.backend.sport.athletisme;
import jakarta.validation.constraints.Positive;

public record AthletismeRequest(
    @Positive(message = "La valeur pour 100 m doit être positive")
    Double m100,

    @Positive(message = "La valeur pour 400 m doit être positive")
    Double m400,

    @Positive(message = "La valeur pour 800 m doit être positive")
    Double m800,

    @Positive(message = "La valeur pour 1500 m doit être positive")
    Double m1500,

    @Positive(message = "La valeur pour 5000 m doit être positive")
    Double m5000,

    @Positive(message = "La valeur pour 10000 m doit être positive")
    Double m10000,

    @Positive(message = "La valeur pour semi-marathon doit être positive")
    Double semiMarathon,

    @Positive(message = "La valeur pour marathon doit être positive")
    Double marathon,

    @Positive(message = "La valeur pour triathlon doit être positive")
    Double triathlon,

    @Positive(message = "La valeur pour ironman doit être positive")
    Double ironman,

    @Positive(message = "La valeur pour longueur doit être positive")
    Double longueur,

    @Positive(message = "La valeur pour hauteur doit être positive")
    Double hauteur
) {
}
