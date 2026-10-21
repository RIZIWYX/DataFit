package com.datafit.backend.sport.sbd;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SBDRepository extends JpaRepository<SBD, Long> {
// La ligne du jour pour un utilisateur (s'il en a une)
Optional<SBD> findByUtilisateurAndDate(Utilisateur utilisateur, LocalDate date);

// La dernière saisie (pour pré-remplir le formulaire)
Optional<SBD> findFirstByUtilisateurOrderByDateDesc(Utilisateur utilisateur);

// Historique complet pour un utilisateur (dashboard, graphiques)
List<SBD> findByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
}
