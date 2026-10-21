package com.datafit.backend.seance.cardio;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CardioService {
private final CardioRepository repo;

public CardioService(CardioRepository repo) {
  this.repo = repo;
}

// Enregistre une seance cardio (plusieurs par jour autorisees).
public Cardio valider(Utilisateur user, CardioRequest req) {
  Cardio seance = new Cardio(
        user, req.nom(),
        req.fcMoy(), req.fcMin(), req.fcMax(),
        req.correlationVitesseFc(), req.dureeS(), req.distanceM(),
        req.vitesseMoyKmh(), req.vitesseMaxKmh(),
        req.tempsMoy1kmS(), req.variationVitesse());
  return repo.save(seance);
}

@Transactional(readOnly = true)
public List<Cardio> historique(Utilisateur user) {
  return repo.findByUtilisateurOrderByDateDesc(user);
}

@Transactional(readOnly = true)
public Optional<Cardio> derniere(Utilisateur user) {
  return repo.findFirstByUtilisateurOrderByDateDesc(user);
}
}
