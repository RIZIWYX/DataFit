package com.datafit.backend.sport.souplesse;
import jakarta.validation.constraints.NotNull;

public record SouplesseRequest(
    @NotNull(message = "La valeur pour facial est requise")
    Double facial,

    @NotNull(message = "La valeur pour antéropostérieur est requise")
    Double anteropost,

    @NotNull(message = "La valeur pour toucher les orteils debout est requise")
    Double todebout,

    @NotNull(message = "La valeur pour toucher les orteils assis est requise")
    Double toassis
) {
}
