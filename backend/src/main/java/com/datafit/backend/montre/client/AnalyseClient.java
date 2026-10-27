package com.datafit.backend.montre.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

// Parle au service d'analyse (Python, analyse/app/main.py) : une seule adresse, "/analyser",
// qui choisit le calcul d'apres le champ "sport" ajoute par le simulateur.
// Les noms des champs renvoyes sont ceux des records ResultatXxx (et ResultatSommeil).
@Component
public class AnalyseClient {

  private final RestClient http;

  public AnalyseClient(@Value("${analyse.url:http://localhost:8001}") String url) {
    this.http = RestClient.create(url);
  }

  // Envoie le resultat brut du simulateur, recupere les metriques typees.
  // <T> = le type de resultat attendu (ResultatCardio, ResultatMuscu,
  // ResultatSommeil...),
  // decide par le service appelant.
  public <T> T analyser(Object donneesSimulation, Class<T> typeResultat) {
    return http.post()
        .uri("/analyser")
        .body(donneesSimulation)
        .retrieve()
        .body(typeResultat);
  }
}
