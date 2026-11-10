package com.datafit.backend.hydratation;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

// Ce que la page Nutrition envoie pour un ajout d'eau (voir frontend/src/services/hydratationService.ts)
public record HydratationRequest(

    @NotNull(message = "La date est obligatoire (format AAAA-MM-JJ)")
    LocalDate date,

    // même limite que la contrainte de la table : un ajout ne dépasse pas 5 L
    @NotNull(message = "La quantité d'eau est obligatoire")
    @Min(value = 1, message = "Quantité d'eau invalide (entre 1 et 5000 ml)")
    @Max(value = HydratationService.ML_MAX, message = "Quantité d'eau invalide (entre 1 et 5000 ml)")
    Integer ml

) {}
