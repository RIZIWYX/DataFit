package com.datafit.backend.utilisateur;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    boolean existsByEmail(String email);

    // « Toto@x.fr » et « toto@x.fr » sont la même adresse : une seule inscription possible
    boolean existsByEmailIgnoreCase(String email);

    Optional<Utilisateur> findByEmail(String email);

    // pour les comptes créés avant que les adresses soient mises en minuscules
    Optional<Utilisateur> findFirstByEmailIgnoreCaseOrderByIdAsc(String email);
}
