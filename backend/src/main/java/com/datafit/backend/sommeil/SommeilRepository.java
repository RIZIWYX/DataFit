package com.datafit.backend.sommeil;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SommeilRepository extends JpaRepository<Sommeil, Long> {
    // Les repas d'un jour, dans l'ordre où ils ont été notés
    List<Sommeil> findByUtilisateurAndDateOrderByIdAsc(Utilisateur utilisateur, LocalDate date);

    // Historique complet pour un utilisateur (dashboard, graphiques), du plus
    // récent au plus ancien
    List<Sommeil> findByUtilisateurOrderByDateDescIdDesc(Utilisateur utilisateur);

    // Supprime un repas seulement s'il appartient à cet utilisateur ; renvoie le
    // nombre de lignes supprimées
    long deleteByIdAndUtilisateur(Long id, Utilisateur utilisateur);

}
