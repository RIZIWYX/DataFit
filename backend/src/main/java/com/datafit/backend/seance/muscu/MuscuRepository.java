package com.datafit.backend.seance.muscu;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MuscuRepository extends JpaRepository<Muscu, Long> {
List<Muscu> findByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
Optional<Muscu> findFirstByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
}
