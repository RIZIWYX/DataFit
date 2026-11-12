package com.datafit.backend.compte;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

// Ce que « Effacer mes données » (page Profil) peut effacer, et où c'est rangé : les tables de db/
// (lignes de l'utilisateur) et les sous-dossiers des mesures de la montre (ArchivesMesures).
// Une nouvelle table avec utilisateur_id dans db/ doit être rangée ici, ou dans
// CompteService.TABLES_GARDEES : EffacementTablesTest échoue tant qu'elle n'est nulle part.
public enum CategorieDonnees {

    @JsonProperty("seances")
    SEANCES(
        List.of("seance_cardio", "seance_velo", "seance_natation", "seance_muscu"),
        List.of("cardio", "velo", "natation", "muscu")),

    @JsonProperty("sommeil")
    SOMMEIL(List.of("sommeil"), List.of("sommeil")),

    @JsonProperty("nutrition")
    NUTRITION(List.of("nutrition", "analyse_nutrition", "hydratation"), List.of()),

    // les performances déclarées (rangs), une table par discipline
    @JsonProperty("performances")
    PERFORMANCES(
        List.of("sbd", "halterofilie", "streetlifting", "calisthenics", "natation", "souplesse", "athletisme"),
        List.of());

    private final List<String> tables;
    private final List<String> mesures;

    CategorieDonnees(List<String> tables, List<String> mesures) {
        this.tables = tables;
        this.mesures = mesures;
    }

    public List<String> tables() {
        return tables;
    }

    public List<String> mesures() {
        return mesures;
    }
}
