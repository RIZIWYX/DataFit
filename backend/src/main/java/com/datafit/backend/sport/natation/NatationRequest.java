package com.datafit.backend.sport.natation;
import jakarta.validation.constraints.Positive;

public record NatationRequest(
    @Positive(message = "La valeur pour crawl doit être positive")
    Double crawl,

    @Positive(message = "La valeur pour dos doit être positive")
    Double dos,

    @Positive(message = "La valeur pour brasse doit être positive")
    Double brassee,

    @Positive(message = "La valeur pour papillon doit être positive")
    Double papillon
) {
}
