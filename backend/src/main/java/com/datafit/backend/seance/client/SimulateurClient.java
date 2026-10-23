package com.datafit.backend.seance.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

// Parle au service simulateur (FastAPI, POST /simuler).
// L'URL vient de application.properties (simulateur.url), defaut localhost:8000.
@Component
public class SimulateurClient {

private final RestClient http;

public SimulateurClient(@Value("${simulateur.url:http://localhost:8000}") String url) {
  this.http = RestClient.create(url);
}

// Envoie profil + seance, renvoie le JSON brut (contient "mesures" + metadonnees).
// Le backend ne lit pas dedans : il le transmet tel quel a l'analyse.
public Object simuler(DemandeSimulation demande) {
  return http.post()
    .uri("/simuler")
    .body(demande)
    .retrieve()
    .body(Object.class);
}
}
