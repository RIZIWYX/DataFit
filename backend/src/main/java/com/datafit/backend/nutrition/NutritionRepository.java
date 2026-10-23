package com.datafit.backend.nutrition;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface NutritionRepository extends JpaRepository<Nutrition, Long> {
    // Les repas d'un jour, dans l'ordre où ils ont été notés
    List<Nutrition> findByUtilisateurAndDateOrderByIdAsc(Utilisateur utilisateur, LocalDate date);

    // Historique complet pour un utilisateur (dashboard, graphiques), du plus
    // récent au plus ancien
    List<Nutrition> findByUtilisateurOrderByDateDescIdDesc(Utilisateur utilisateur);

    // Supprime un repas seulement s'il appartient à cet utilisateur ; renvoie le
    // nombre de lignes supprimées
    long deleteByIdAndUtilisateur(Long id, Utilisateur utilisateur);

}
