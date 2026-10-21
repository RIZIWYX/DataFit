package com.datafit.backend.sport.athletisme;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AthletismeRepository extends JpaRepository<Athletisme, Long> {
// La ligne du jour pour un utilisateur (s'il en a une)
Optional<Athletisme> findByUtilisateurAndDate(Utilisateur utilisateur, LocalDate date);

// La dernière saisie (pour pré-remplir le formulaire)
Optional<Athletisme> findFirstByUtilisateurOrderByDateDesc(Utilisateur utilisateur);

// Historique complet pour un utilisateur (dashboard, graphiques)
List<Athletisme> findByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
}
