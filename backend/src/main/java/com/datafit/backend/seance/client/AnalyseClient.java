package com.datafit.backend.seance.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

// Parle au service d'analyse (Python).
// ATTENTION : ce service n'est pas encore code (analyse/app/main.py est vide).
// A confirmer quand il existera :
//   - le chemin de l'endpoint (ici "/analyser")
//   - les noms des champs renvoyes (voir les records ResultatXxx)
@Component
public class AnalyseClient {

private final RestClient http;

public AnalyseClient(@Value("${analyse.url:http://localhost:8001}") String url) {
  this.http = RestClient.create(url);
}

// Envoie le resultat brut du simulateur, recupere les metriques typees.
// <T> = le type de resultat attendu (ResultatCardio, ResultatMuscu, ...),
// decide par le service appelant.
public <T> T analyser(Object donneesSimulation, Class<T> typeResultat) {
  return http.post()
    .uri("/analyser")
    .body(donneesSimulation)
    .retrieve()
    .body(typeResultat);
}
}
