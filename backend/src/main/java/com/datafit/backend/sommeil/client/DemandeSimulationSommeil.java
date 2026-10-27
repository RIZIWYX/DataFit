package com.datafit.backend.sommeil.client;

// Corps complet envoye a POST /simuler pour une nuit.
// ATTENTION : le modele Pydantic "DemandeSimulation" du simulateur attend
// {"profil", "seance": {"type": "sommeil", "nom", "date"}}, pas "sommeil" : il repondra 422.
public record DemandeSimulationSommeil(
                ProfilSimulationSommeil profil,
                SimulationSommeil sommeil) {
}
