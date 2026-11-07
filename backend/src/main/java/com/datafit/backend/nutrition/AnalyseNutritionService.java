
package com.datafit.backend.nutrition;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.datafit.backend.montre.client.AnalyseClient;
import com.datafit.backend.utilisateur.Utilisateur;

@Service
public class AnalyseNutritionService {

    private final NutritionRepository nutritionRepo;
    private final AnalyseNutritionRepository analyseRepo;
    private final AnalyseClient analyseClient;

    public AnalyseNutritionService(
            NutritionRepository nutritionRepo,
            AnalyseNutritionRepository analyseRepo,
            AnalyseClient analyseClient) {
        this.nutritionRepo = nutritionRepo;
        this.analyseRepo = analyseRepo;
        this.analyseClient = analyseClient;
    }

    @Transactional
    public AnalyseNutrition analyserJour(Utilisateur utilisateur, LocalDate date) {
        List<Nutrition> repas = nutritionRepo
                .findByUtilisateurAndDateOrderByIdAsc(utilisateur, date);

        if (repas.isEmpty()) {
            throw new IllegalArgumentException(
                    "Aucun repas enregistré pour cette date.");
        }

        List<Map<String, Object>> repasPython = repas.stream().map(r -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("moment", r.getRepas());
            item.put("nom", r.getNom());
            item.put("objectif", r.getObjectif());
            item.put("calories", r.getCalories());
            item.put("proteines", r.getProteines());
            item.put("glucides", r.getGlucides());
            item.put("lipides", r.getLipides());
            return item;
        }).toList();

        Map<String, Object> donnees = new LinkedHashMap<>();
        donnees.put("sport", "nutrition");
        donnees.put("date", date.toString());
        donnees.put("repas", repasPython);

        ResultatNutrition resultat = analyseClient.analyser(
                donnees, ResultatNutrition.class);

        AnalyseNutrition analyse = new AnalyseNutrition(
                utilisateur,
                date,
                resultat.nombre_repas(),
                resultat.variation_calories(),
                resultat.energie_macros_kcal(),
                resultat.ecart_calories_macros(),
                resultat.ecart_calories_macros_pct(),
                resultat.statistiques(),
                resultat.repartition_macros(),
                resultat.correlations_calories(),
                resultat.repartition_repas(),
                resultat.repas_plus_calorique(),
                resultat.repas_plus_proteine());

        AnalyseNutrition existante = analyseRepo
                .findByUtilisateurAndDate(utilisateur, date)
                .orElse(null);

        if (existante != null) {
            analyseRepo.delete(existante);
            analyseRepo.flush();
        }

        return analyseRepo.save(analyse);
    }
}
