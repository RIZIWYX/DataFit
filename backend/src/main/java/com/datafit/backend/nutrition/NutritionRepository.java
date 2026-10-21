package com.datafit.backend.nutrition;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface NutritionRepository extends JpaRepository<Nutrition, Long> {
    // La ligne du jour pour un utilisateur (s'il en a une)
    Optional<Nutrition> findByUtilisateurAndDate(Utilisateur utilisateur, LocalDate date);

    // La dernière saisie (pour pré-remplir le formulaire)
    Optional<Nutrition> findFirstByUtilisateurOrderByDateDesc(Utilisateur utilisateur);

    // Historique complet pour un utilisateur (dashboard, graphiques)
    List<Nutrition> findByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
}