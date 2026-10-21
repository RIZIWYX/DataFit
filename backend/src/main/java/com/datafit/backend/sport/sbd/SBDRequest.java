package com.datafit.backend.sport.sbd;
import jakarta.validation.constraints.Positive;

public record SBDRequest(

    @Positive(message = "La charge doit être un nombre positif")
    Double bench,

    @Positive(message = "La charge doit être un nombre positif")
    Double squat,

    @Positive(message = "La charge doit être un nombre positif")
    Double deadlift) {
}
