package com.datafit.backend.sport.natation;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NatationService {
private final NatationRepository repo;

public NatationService(NatationRepository repo) {
  this.repo = repo;
}

// Bouton "Valider" : crée la ligne du jour.
// Refuse s'il y a déjà une ligne aujourd'hui pour cet utilisateur.
public Natation valider(Utilisateur user, NatationRequest req) {
  if (repo.findByUtilisateurAndDate(user, LocalDate.now()).isPresent()) {
    throw new IllegalStateException(
          "Une séance Natation a déjà été enregistrée aujourd'hui."
          );
  }
  Natation entity = new Natation(user, req.crawl(), req.dos(), req.brassee(), req.papillon());
  return repo.save(entity);
}

// Bouton "Modifier" : corrige la ligne du jour sans changer la date.
public Natation modifierCelleDuJour(Utilisateur user, NatationRequest req) {
  Natation entity = repo.findByUtilisateurAndDate(user, LocalDate.now())
      .orElseThrow(() -> new IllegalStateException(
        "Aucune séance aujourd'hui à modifier."
        ));
  appliquer(entity, req);
  return repo.save(entity);
}

// Pour pré-remplir le formulaire au chargement de la page
@Transactional(readOnly = true)
public Optional<Natation> dernierePerf(Utilisateur user) {
  return repo.findFirstByUtilisateurOrderByDateDesc(user);
}

// Pour savoir si on affiche "Valider" ou "Modifier"
@Transactional(readOnly = true)
public Optional<Natation> celleDuJour(Utilisateur user) {
  return repo.findByUtilisateurAndDate(user, LocalDate.now());
}

@Transactional(readOnly = true)
public List<Natation> historique(Utilisateur user) {
  return repo.findByUtilisateurOrderByDateDesc(user);
}

// --- helpers ---


private void appliquer(Natation e, NatationRequest req) {
  e.setCrawl(req.crawl());
  e.setDos(req.dos());
  e.setBrassee(req.brassee());
  e.setPapillon(req.papillon());
}
}