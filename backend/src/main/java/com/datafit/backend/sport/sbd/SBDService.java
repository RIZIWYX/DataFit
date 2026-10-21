package com.datafit.backend.sport.sbd;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SBDService {
private final SBDRepository repo;

public SBDService(SBDRepository repo) {
  this.repo = repo;
}

// Bouton "Valider" : crée la ligne du jour.
// Refuse s'il y a déjà une ligne aujourd'hui pour cet utilisateur.
public SBD valider(Utilisateur user, SBDRequest req) {
  if (repo.findByUtilisateurAndDate(user, LocalDate.now()).isPresent()) {
    throw new IllegalStateException(
          "Une séance SBD a déjà été enregistrée aujourd'hui."
          );
  }
  SBD sbd = new SBD(
        user,
        req.bench(),
        req.squat(),
        req.deadlift()
        );
  return repo.save(sbd);
}

// Bouton "Modifier" : corrige la ligne du jour sans changer la date.
public SBD modifierCelleDuJour(Utilisateur user, SBDRequest req) {
  SBD sbd = repo.findByUtilisateurAndDate(user, LocalDate.now())
      .orElseThrow(() -> new IllegalStateException(
        "Aucune séance aujourd'hui à modifier."
        ));
  sbd.setBench(req.bench());
  sbd.setSquat(req.squat());
  sbd.setDeadlift(req.deadlift());
  return repo.save(sbd);
}

// Pour pré-remplir le formulaire au chargement de la page
@Transactional(readOnly = true)
public Optional<SBD> dernierePerf(Utilisateur user) {
  return repo.findFirstByUtilisateurOrderByDateDesc(user);
}

// Pour savoir si on affiche "Valider" ou "Modifier"
@Transactional(readOnly = true)
public Optional<SBD> celleDuJour(Utilisateur user) {
  return repo.findByUtilisateurAndDate(user, LocalDate.now());
}

@Transactional(readOnly = true)
public List<SBD> historique(Utilisateur user) {
  return repo.findByUtilisateurOrderByDateDesc(user);
}
}
