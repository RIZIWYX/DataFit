package com.datafit.backend.montre.client;

// Corps complet envoye a POST /simuler (modele Pydantic "DemandeSimulation").
public record DemandeSimulation(
                ProfilSimulation profil,
                SeanceSimulation seance) {
}
