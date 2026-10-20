package com.datafit.backend.sport.natation;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface NatationRepository extends JpaRepository<Natation, Long> {
// La ligne du jour pour un utilisateur (s'il en a une)
Optional<Natation> findByUtilisateurAndDate(Utilisateur utilisateur, LocalDate date);

// La dernière saisie (pour pré-remplir le formulaire)
Optional<Natation> findFirstByUtilisateurOrderByDateDesc(Utilisateur utilisateur);

// Historique complet pour un utilisateur (dashboard, graphiques)
List<Natation> findByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
}
