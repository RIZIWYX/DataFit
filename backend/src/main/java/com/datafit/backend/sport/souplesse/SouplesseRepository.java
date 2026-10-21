package com.datafit.backend.sport.souplesse;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SouplesseRepository extends JpaRepository<Souplesse, Long> {
// La ligne du jour pour un utilisateur (s'il en a une)
Optional<Souplesse> findByUtilisateurAndDate(Utilisateur utilisateur, LocalDate date);

// La dernière saisie (pour pré-remplir le formulaire)
Optional<Souplesse> findFirstByUtilisateurOrderByDateDesc(Utilisateur utilisateur);

// Historique complet pour un utilisateur (dashboard, graphiques)
List<Souplesse> findByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
}
