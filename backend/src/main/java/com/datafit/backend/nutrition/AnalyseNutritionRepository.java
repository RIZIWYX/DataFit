
package com.datafit.backend.nutrition;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.datafit.backend.utilisateur.Utilisateur;

public interface AnalyseNutritionRepository
        extends JpaRepository<AnalyseNutrition, Long> {

    Optional<AnalyseNutrition> findByUtilisateurAndDate(
            Utilisateur utilisateur, LocalDate date);
}
