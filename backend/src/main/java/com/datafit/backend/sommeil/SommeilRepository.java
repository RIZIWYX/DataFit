package com.datafit.backend.sommeil;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SommeilRepository extends JpaRepository<Sommeil, Long> {
    // La nuit qui se termine ce jour-là : réveil entre le début (inclus) et la fin (exclue) du jour
    Optional<Sommeil> findFirstByUtilisateurAndHeureReveilGreaterThanEqualAndHeureReveilLessThanOrderByHeureReveilDesc(
            Utilisateur utilisateur, LocalDateTime debut, LocalDateTime fin);

    // Historique complet pour un utilisateur (graphiques), de la nuit la plus récente à la plus ancienne
    List<Sommeil> findByUtilisateurOrderByHeureCoucherDesc(Utilisateur utilisateur);

    // Une nuit déjà enregistrée avec la même heure de coucher
    boolean existsByUtilisateurAndHeureCoucher(Utilisateur utilisateur, LocalDateTime heureCoucher);

    // Supprime une nuit seulement si elle appartient à cet utilisateur ; renvoie le
    // nombre de lignes supprimées
    long deleteByIdAndUtilisateur(Long id, Utilisateur utilisateur);
}
