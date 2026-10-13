package com.datafit.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class HelloController {
@GetMapping("/hello")
public String hello() {
  return "Bonjour DataFit ! Le backend Spring Boot fonctionne.";
}

@GetMapping("/heart-rate")
public HeartRateResponse getHeartRate() {
  return new HeartRateResponse(
        78,
        "normal",
        "Fréquence cardiaque récupérée avec succès"
        );
}
}
