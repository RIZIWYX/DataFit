package com.datafit.backend.sport.halterofilie;
import jakarta.validation.constraints.Positive;

public record HalterofilieRequest(
    @Positive(message = "La valeur pour arraché doit être positive")
    Double aracher,

    @Positive(message = "La valeur pour épaulé-jeté doit être positive")
    Double epolejette
) {
}
