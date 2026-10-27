package com.datafit.backend.sommeil.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

// Parle au service simulateur (FastAPI, POST /simuler) pour une nuit.
// L'URL vient de application.properties (simulateur.url), defaut localhost:8000.
@Component
public class SimulateurClientSommeil {

  private final RestClient http;

  public SimulateurClientSommeil(@Value("${simulateur.url:http://localhost:8000}") String url) {
    this.http = RestClient.create(url);
  }

  // Envoie profil + nuit, renvoie le JSON brut (contient "mesures" +
  // metadonnees).
  // Le backend ne lit pas dedans : il le transmet tel quel a l'analyse.
  public Object simuler(DemandeSimulationSommeil demande) {
    return http.post()
        .uri("/simuler")
        .body(demande)
        .retrieve()
        .body(Object.class);
  }
}
