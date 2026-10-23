package com.datafit.backend.seance.natation;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// Renomme (prefixe Seance) pour ne pas entrer en conflit avec
// sport.natation.NatationRepository (meme nom court).
public interface SeanceNatationRepository extends JpaRepository<Natation, Long> {
List<Natation> findByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
Optional<Natation> findFirstByUtilisateurOrderByDateDesc(Utilisateur utilisateur);
}
