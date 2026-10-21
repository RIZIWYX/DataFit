package com.datafit.backend.seance.velo;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VeloRepository extends JpaRepository<Velo, Long> {
List<Velo> findByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
Optional<Velo> findFirstByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
}
