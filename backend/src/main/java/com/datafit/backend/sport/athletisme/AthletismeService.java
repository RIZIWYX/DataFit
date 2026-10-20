package com.datafit.backend.sport.athletisme;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AthletismeService {
private final AthletismeRepository repo;

public AthletismeService(AthletismeRepository repo) {
  this.repo = repo;
}

// Bouton "Valider" : crée la ligne du jour.
// Refuse s'il y a déjà une ligne aujourd'hui pour cet utilisateur.
public Athletisme valider(Utilisateur user, AthletismeRequest req) {
  if (repo.findByUtilisateurAndDate(user, LocalDate.now()).isPresent()) {
    throw new IllegalStateException(
          "Une séance Athletisme a déjà été enregistrée aujourd'hui."
          );
  }
  Athletisme entity = new Athletisme(user, req.m100(), req.m400(), req.m800(), req.m1500(), req.m5000(), req.m10000(), req.semiMarathon(), req.marathon(), req.triathlon(), req.ironman(), req.longueur(), req.hauteur());
  return repo.save(entity);
}

// Bouton "Modifier" : corrige la ligne du jour sans changer la date.
public Athletisme modifierCelleDuJour(Utilisateur user, AthletismeRequest req) {
  Athletisme entity = repo.findByUtilisateurAndDate(user, LocalDate.now())
      .orElseThrow(() -> new IllegalStateException(
        "Aucune séance aujourd'hui à modifier."
        ));
  appliquer(entity, req);
  return repo.save(entity);
}

// Pour pré-remplir le formulaire au chargement de la page
@Transactional(readOnly = true)
public Optional<Athletisme> dernierePerf(Utilisateur user) {
  return repo.findFirstByUtilisateurOrderByDateDesc(user);
}

// Pour savoir si on affiche "Valider" ou "Modifier"
@Transactional(readOnly = true)
public Optional<Athletisme> celleDuJour(Utilisateur user) {
  return repo.findByUtilisateurAndDate(user, LocalDate.now());
}

@Transactional(readOnly = true)
public List<Athletisme> historique(Utilisateur user) {
  return repo.findByUtilisateurOrderByDateDesc(user);
}

// --- helpers ---


private void appliquer(Athletisme e, AthletismeRequest req) {
  e.setM100(req.m100());
  e.setM400(req.m400());
  e.setM800(req.m800());
  e.setM1500(req.m1500());
  e.setM5000(req.m5000());
  e.setM10000(req.m10000());
  e.setSemiMarathon(req.semiMarathon());
  e.setMarathon(req.marathon());
  e.setTriathlon(req.triathlon());
  e.setIronman(req.ironman());
  e.setLongueur(req.longueur());
  e.setHauteur(req.hauteur());
}
}