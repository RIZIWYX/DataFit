
package com.datafit.backend.nutrition;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;

@RestController
@RequestMapping("/api/nutrition")
public class AnalyseNutritionController {

    private final AnalyseNutritionService analyseService;
    private final UtilisateurRepository utilisateurRepo;

    public AnalyseNutritionController(
            AnalyseNutritionService analyseService,
            UtilisateurRepository utilisateurRepo) {
        this.analyseService = analyseService;
        this.utilisateurRepo = utilisateurRepo;
    }

    @GetMapping("/{utilisateurId}/analyse/{date}")
    public AnalyseNutrition analyserJour(
            @PathVariable Long utilisateurId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        Utilisateur utilisateur = utilisateurRepo.findById(utilisateurId)
                .orElseThrow();

        return analyseService.analyserJour(utilisateur, date);
    }
}
