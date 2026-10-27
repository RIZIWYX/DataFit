package com.datafit.backend.sommeil;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDateTime;

// Le résumé d'une nuit, tel que l'analyse le calcule. Mêmes champs que la table sommeil.
// Horaires au format AAAA-MM-JJTHH:MM:SS, durées en secondes, FC en bpm.
// @PositiveOrZero seul laisse passer une valeur absente : @NotNull la refuse avant qu'elle n'atteigne la base.
public record SommeilRequest(
        @NotNull(message = "L'heure de coucher est obligatoire") LocalDateTime heureCoucher,

        @NotNull(message = "L'heure de réveil est obligatoire") LocalDateTime heureReveil,

        @NotNull(message = "Le temps au lit est obligatoire") @PositiveOrZero(message = "Le temps au lit ne peut pas être négatif") Integer tempsAuLitS,

        @NotNull(message = "La durée de sommeil est obligatoire") @PositiveOrZero(message = "La durée de sommeil ne peut pas être négative") Integer dureeSommeilS,

        @NotNull(message = "La latence d'endormissement est obligatoire") @PositiveOrZero(message = "La latence d'endormissement ne peut pas être négative") Integer latenceEndormissementS,

        @NotNull(message = "La durée d'éveil totale est obligatoire") @PositiveOrZero(message = "La durée d'éveil totale ne peut pas être négative") Integer dureeEveilTotaleS,

        @NotNull(message = "L'éveil nocturne est obligatoire") @PositiveOrZero(message = "L'éveil nocturne ne peut pas être négatif") Integer eveilNocturneS,

        @NotNull(message = "Le nombre de réveils est obligatoire") @PositiveOrZero(message = "Le nombre de réveils ne peut pas être négatif") Integer reveilsNb,

        @NotNull(message = "L'efficacité du sommeil est obligatoire") @PositiveOrZero(message = "L'efficacité du sommeil ne peut pas être négative") @DecimalMax(value = "100", message = "L'efficacité du sommeil ne peut pas dépasser 100 %") Double efficaciteSommeilPct,

        @NotNull(message = "La FC moyenne est obligatoire") @Positive(message = "La FC moyenne doit être positive") Double fcMoyenne,

        @NotNull(message = "La FC minimale est obligatoire") @Positive(message = "La FC minimale doit être positive") Double fcMin,

        @NotNull(message = "La FC maximale est obligatoire") @Positive(message = "La FC maximale doit être positive") Double fcMax,

        @NotNull(message = "La durée d'éveil est obligatoire") @PositiveOrZero(message = "La durée d'éveil ne peut pas être négative") Integer dureeEveilS,

        @NotNull(message = "La durée de sommeil léger est obligatoire") @PositiveOrZero(message = "La durée de sommeil léger ne peut pas être négative") Integer dureeLegerS,

        @NotNull(message = "La durée de sommeil profond est obligatoire") @PositiveOrZero(message = "La durée de sommeil profond ne peut pas être négative") Integer dureeProfondS,

        @NotNull(message = "La durée de sommeil paradoxal est obligatoire") @PositiveOrZero(message = "La durée de sommeil paradoxal ne peut pas être négative") Integer dureeParadoxalS) {

    // mêmes règles que les contraintes CHECK de la table : une erreur 400 lisible
    // plutôt qu'un refus de la base
    @AssertTrue(message = "L'heure de réveil doit être après l'heure de coucher")
    public boolean isHorairesCoherents() {
        return heureCoucher == null || heureReveil == null || heureReveil.isAfter(heureCoucher);
    }

    @AssertTrue(message = "La FC doit respecter minimale ≤ moyenne ≤ maximale")
    public boolean isFcCoherente() {
        return fcMin == null || fcMoyenne == null || fcMax == null || (fcMin <= fcMoyenne && fcMoyenne <= fcMax);
    }
}
