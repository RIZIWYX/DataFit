package com.datafit.backend.sport.streetlifting;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StreetliftingRepository extends JpaRepository<Streetlifting, Long> {
// La ligne du jour pour un utilisateur (s'il en a une)
Optional<Streetlifting> findByUtilisateurAndDate(Utilisateur utilisateur, LocalDate date);

// La dernière saisie (pour pré-remplir le formulaire)
Optional<Streetlifting> findFirstByUtilisateurOrderByDateDesc(Utilisateur utilisateur);

// Historique complet pour un utilisateur (dashboard, graphiques)
List<Streetlifting> findByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
}
