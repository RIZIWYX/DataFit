package com.datafit.backend.montre.sommeil;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

// Metriques renvoyees par le service d'analyse pour une nuit.
// L'analyse (Python) les renvoie en snake_case, comme les colonnes de la table sommeil :
// @JsonProperty fait le lien avec les noms Java.
public record ResultatSommeil(
        @JsonProperty("heure_coucher") LocalDateTime heureCoucher,
        @JsonProperty("heure_reveil") LocalDateTime heureReveil,
        @JsonProperty("temps_au_lit_s") Integer tempsAuLitS,
        @JsonProperty("duree_sommeil_s") Integer dureeSommeilS,
        @JsonProperty("latence_endormissement_s") Integer latenceEndormissementS,
        @JsonProperty("duree_eveil_totale_s") Integer dureeEveilTotaleS,
        @JsonProperty("eveil_nocturne_s") Integer eveilNocturneS,
        @JsonProperty("reveils_nb") Integer reveilsNb,
        @JsonProperty("efficacite_sommeil_pct") Double efficaciteSommeilPct,
        @JsonProperty("fc_moyenne") Double fcMoyenne,
        @JsonProperty("fc_min") Double fcMin,
        @JsonProperty("fc_max") Double fcMax,
        @JsonProperty("duree_eveil_s") Integer dureeEveilS,
        @JsonProperty("duree_leger_s") Integer dureeLegerS,
        @JsonProperty("duree_profond_s") Integer dureeProfondS,
        @JsonProperty("duree_paradoxal_s") Integer dureeParadoxalS) {

}
