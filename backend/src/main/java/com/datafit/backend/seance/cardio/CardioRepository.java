package com.datafit.backend.seance.cardio;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CardioRepository extends JpaRepository<Cardio, Long> {
List<Cardio> findByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
Optional<Cardio> findFirstByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
}
