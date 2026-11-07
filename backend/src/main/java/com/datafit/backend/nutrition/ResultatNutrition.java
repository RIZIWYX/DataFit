
package com.datafit.backend.nutrition;

import java.time.LocalDate;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ResultatNutrition(
        LocalDate date,
        Integer nombre_repas,
        Map<String, Object> statistiques,
        Double variation_calories,
        Map<String, Object> repartition_macros,
        Double energie_macros_kcal,
        Double ecart_calories_macros,
        Double ecart_calories_macros_pct,
        Map<String, Object> correlations_calories,
        Map<String, Object> repartition_repas,
        String repas_plus_calorique,
        String repas_plus_proteine
) {
}
