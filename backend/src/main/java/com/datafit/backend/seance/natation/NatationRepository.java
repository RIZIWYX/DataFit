package com.datafit.backend.seance.natation;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NatationRepository extends JpaRepository<Natation, Long> {
List<Natation> findByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
Optional<Natation> findFirstByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
}
