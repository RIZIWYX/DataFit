package com.datafit.backend.seance.client;

// Corps complet envoye a POST /simuler (modele Pydantic "DemandeSimulation").
public record DemandeSimulation(
    ProfilSimulation profil,
    SeanceSimulation seance) {
}
