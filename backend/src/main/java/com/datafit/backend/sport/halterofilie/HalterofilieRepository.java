package com.datafit.backend.sport.halterofilie;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HalterofilieRepository extends JpaRepository<Halterofilie, Long> {
// La ligne du jour pour un utilisateur (s'il en a une)
Optional<Halterofilie> findByUtilisateurAndDate(Utilisateur utilisateur, LocalDate date);

// La dernière saisie (pour pré-remplir le formulaire)
Optional<Halterofilie> findFirstByUtilisateurOrderByDateDesc(Utilisateur utilisateur);

// Historique complet pour un utilisateur (dashboard, graphiques)
List<Halterofilie> findByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
}
