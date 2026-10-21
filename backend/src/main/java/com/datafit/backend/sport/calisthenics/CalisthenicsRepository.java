package com.datafit.backend.sport.calisthenics;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CalisthenicsRepository extends JpaRepository<Calisthenics, Long> {
// La ligne du jour pour un utilisateur (s'il en a une)
Optional<Calisthenics> findByUtilisateurAndDate(Utilisateur utilisateur, LocalDate date);

// La dernière saisie (pour pré-remplir le formulaire)
Optional<Calisthenics> findFirstByUtilisateurOrderByDateDesc(Utilisateur utilisateur);

// Historique complet pour un utilisateur (dashboard, graphiques)
List<Calisthenics> findByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
}
