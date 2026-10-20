package com.datafit.backend.sport.souplesse;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SouplesseService {
private final SouplesseRepository repo;

public SouplesseService(SouplesseRepository repo) {
  this.repo = repo;
}

// Bouton "Valider" : crée la ligne du jour.
// Refuse s'il y a déjà une ligne aujourd'hui pour cet utilisateur.
public Souplesse valider(Utilisateur user, SouplesseRequest req) {
  if (repo.findByUtilisateurAndDate(user, LocalDate.now()).isPresent()) {
    throw new IllegalStateException(
          "Une séance Souplesse a déjà été enregistrée aujourd'hui."
          );
  }
  Souplesse entity = new Souplesse(user, req.facial(), req.anteropost(), req.todebout(), req.toassis());
  return repo.save(entity);
}

// Bouton "Modifier" : corrige la ligne du jour sans changer la date.
public Souplesse modifierCelleDuJour(Utilisateur user, SouplesseRequest req) {
  Souplesse entity = repo.findByUtilisateurAndDate(user, LocalDate.now())
      .orElseThrow(() -> new IllegalStateException(
        "Aucune séance aujourd'hui à modifier."
        ));
  appliquer(entity, req);
  return repo.save(entity);
}

// Pour pré-remplir le formulaire au chargement de la page
@Transactional(readOnly = true)
public Optional<Souplesse> dernierePerf(Utilisateur user) {
  return repo.findFirstByUtilisateurOrderByDateDesc(user);
}

// Pour savoir si on affiche "Valider" ou "Modifier"
@Transactional(readOnly = true)
public Optional<Souplesse> celleDuJour(Utilisateur user) {
  return repo.findByUtilisateurAndDate(user, LocalDate.now());
}

@Transactional(readOnly = true)
public List<Souplesse> historique(Utilisateur user) {
  return repo.findByUtilisateurOrderByDateDesc(user);
}

// --- helpers ---


private void appliquer(Souplesse e, SouplesseRequest req) {
  e.setFacial(req.facial());
  e.setAnteropost(req.anteropost());
  e.setTodebout(req.todebout());
  e.setToassis(req.toassis());
}
}