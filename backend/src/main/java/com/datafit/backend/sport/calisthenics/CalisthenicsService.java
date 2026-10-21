package com.datafit.backend.sport.calisthenics;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CalisthenicsService {
private final CalisthenicsRepository repo;

public CalisthenicsService(CalisthenicsRepository repo) {
  this.repo = repo;
}

// Bouton "Valider" : crée la ligne du jour.
// Refuse s'il y a déjà une ligne aujourd'hui pour cet utilisateur.
public Calisthenics valider(Utilisateur user, CalisthenicsRequest req) {
  if (repo.findByUtilisateurAndDate(user, LocalDate.now()).isPresent()) {
    throw new IllegalStateException(
          "Une séance Calisthenics a déjà été enregistrée aujourd'hui."
          );
  }
  Calisthenics entity = new Calisthenics(user, req.traction(), req.dip(), req.pompe(), req.muscleup(), req.pistol(), req.lSit(), req.handstand(), req.frontLever(), req.oap(), req.flag(), req.planche(), req.crucifix());
  return repo.save(entity);
}

// Bouton "Modifier" : corrige la ligne du jour sans changer la date.
public Calisthenics modifierCelleDuJour(Utilisateur user, CalisthenicsRequest req) {
  Calisthenics entity = repo.findByUtilisateurAndDate(user, LocalDate.now())
      .orElseThrow(() -> new IllegalStateException(
        "Aucune séance aujourd'hui à modifier."
        ));
  appliquer(entity, req);
  return repo.save(entity);
}

// Pour pré-remplir le formulaire au chargement de la page
@Transactional(readOnly = true)
public Optional<Calisthenics> dernierePerf(Utilisateur user) {
  return repo.findFirstByUtilisateurOrderByDateDesc(user);
}

// Pour savoir si on affiche "Valider" ou "Modifier"
@Transactional(readOnly = true)
public Optional<Calisthenics> celleDuJour(Utilisateur user) {
  return repo.findByUtilisateurAndDate(user, LocalDate.now());
}

@Transactional(readOnly = true)
public List<Calisthenics> historique(Utilisateur user) {
  return repo.findByUtilisateurOrderByDateDesc(user);
}

// --- helpers ---


private void appliquer(Calisthenics e, CalisthenicsRequest req) {
  e.setTraction(req.traction());
  e.setDip(req.dip());
  e.setPompe(req.pompe());
  e.setMuscleup(req.muscleup());
  e.setPistol(req.pistol());
  e.setLSit(req.lSit());
  e.setHandstand(req.handstand());
  e.setFrontLever(req.frontLever());
  e.setOap(req.oap());
  e.setFlag(req.flag());
  e.setPlanche(req.planche());
  e.setCrucifix(req.crucifix());
}
}