package com.datafit.backend.sommeil.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.datafit.backend.sommeil.ResultatSommeil;

// Parle au service d'analyse (Python) pour une nuit.
// ATTENTION : ce service n'est pas encore code (analyse/app/main.py est vide).
// A confirmer quand il existera :
//   - le chemin de l'endpoint (ici "/analyser", le meme que pour les seances)
//   - les noms des champs renvoyes (voir ResultatSommeil)
@Component
public class AnalyseClientSommeil {

  private final RestClient http;

  public AnalyseClientSommeil(@Value("${analyse.url:http://localhost:8001}") String url) {
    this.http = RestClient.create(url);
  }

  // Envoie les mesures brutes de la nuit (sorties du simulateur), recupere les 16 valeurs.
  public ResultatSommeil analyser(Object donneesSimulation) {
    return http.post()
        .uri("/analyser")
        .body(donneesSimulation)
        .retrieve()
        .body(ResultatSommeil.class);
  }
}
