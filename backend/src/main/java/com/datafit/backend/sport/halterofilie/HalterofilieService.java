package com.datafit.backend.sport.halterofilie;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class HalterofilieService {
private final HalterofilieRepository repo;

public HalterofilieService(HalterofilieRepository repo) {
  this.repo = repo;
}

// Bouton "Valider" : crée la ligne du jour.
// Refuse s'il y a déjà une ligne aujourd'hui pour cet utilisateur.
public Halterofilie valider(Utilisateur user, HalterofilieRequest req) {
  if (repo.findByUtilisateurAndDate(user, LocalDate.now()).isPresent()) {
    throw new IllegalStateException(
          "Une séance Halterofilie a déjà été enregistrée aujourd'hui."
          );
  }
  Halterofilie entity = new Halterofilie(user, req.aracher(), req.epolejette());
  return repo.save(entity);
}

// Bouton "Modifier" : corrige la ligne du jour sans changer la date.
public Halterofilie modifierCelleDuJour(Utilisateur user, HalterofilieRequest req) {
  Halterofilie entity = repo.findByUtilisateurAndDate(user, LocalDate.now())
      .orElseThrow(() -> new IllegalStateException(
        "Aucune séance aujourd'hui à modifier."
        ));
  appliquer(entity, req);
  return repo.save(entity);
}

// Pour pré-remplir le formulaire au chargement de la page
@Transactional(readOnly = true)
public Optional<Halterofilie> dernierePerf(Utilisateur user) {
  return repo.findFirstByUtilisateurOrderByDateDesc(user);
}

// Pour savoir si on affiche "Valider" ou "Modifier"
@Transactional(readOnly = true)
public Optional<Halterofilie> celleDuJour(Utilisateur user) {
  return repo.findByUtilisateurAndDate(user, LocalDate.now());
}

@Transactional(readOnly = true)
public List<Halterofilie> historique(Utilisateur user) {
  return repo.findByUtilisateurOrderByDateDesc(user);
}

// --- helpers ---


private void appliquer(Halterofilie e, HalterofilieRequest req) {
  e.setAracher(req.aracher());
  e.setEpolejette(req.epolejette());
}
}