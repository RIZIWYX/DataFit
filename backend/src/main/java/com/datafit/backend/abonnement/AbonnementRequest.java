package com.datafit.backend.abonnement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// Ce que la page Premium envoie pour souscrire ou changer de périodicité
// (voir frontend/src/services/abonnementService.ts)
public record AbonnementRequest(

    @NotBlank(message = "La périodicité est obligatoire")
    @Pattern(regexp = "^(mensuel|annuel)$", message = "Périodicité invalide (mensuel ou annuel)")
    String periodicite

) {}
