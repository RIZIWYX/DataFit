package com.datafit.backend.sommeil.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

// Profil envoye au simulateur. Les noms JSON doivent coller au modele
// Pydantic "Profil" du service simulateur (main.py).
public record ProfilSimulationSommeil(
        @JsonProperty("utilisateur_id") Long utilisateurId,
        String sexe, // "H" ou "F"
        double poids,
        double taille,
        String niveau, // "novice" / "intermediaire" / "confirmer"
        @JsonProperty("date_naissance") LocalDate dateNaissance) {
}
