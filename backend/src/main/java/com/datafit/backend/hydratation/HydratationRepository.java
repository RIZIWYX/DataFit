package com.datafit.backend.hydratation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HydratationRepository extends JpaRepository<Hydratation, Long> {

    // les ajouts d'une journée, du plus ancien au plus récent
    List<Hydratation> findByUtilisateurIdAndDateOrderByIdAsc(Long utilisateurId, LocalDate date);

    // l'utilisateur dans la recherche : on ne touche jamais à l'eau d'un autre compte
    Optional<Hydratation> findByIdAndUtilisateurId(Long id, Long utilisateurId);
}
