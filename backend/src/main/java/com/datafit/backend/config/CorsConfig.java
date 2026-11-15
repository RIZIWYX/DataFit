package com.datafit.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

  // Les sites autorisés à appeler l'API, séparés par des virgules. Par défaut : Docker en local
  // (3000), Vite en dev (5173) et le site en ligne. Pour un autre domaine (mise en ligne HTTPS,
  // Kubernetes...), on le met dans la variable d'environnement CORS_ORIGINS, sans toucher au code.
  // Jamais "*" : l'API manipule des comptes (allowCredentials).
  private final String[] origines;

  public CorsConfig(@Value("${datafit.cors.origines}") String[] origines) {
    this.origines = origines;
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
        .allowedOrigins(origines)
        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true);
  }
}
