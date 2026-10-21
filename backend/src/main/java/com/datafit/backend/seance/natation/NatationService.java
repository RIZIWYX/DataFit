package com.datafit.backend.seance.natation;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NatationService {
private final NatationRepository repo;

public NatationService(NatationRepository repo) {
  this.repo = repo;
}

// Enregistre une seance natation (plusieurs par jour autorisees).
public Natation valider(Utilisateur user, NatationRequest req) {
  Natation seance = new Natation(
        user, req.nom(),
        req.fcMin(), req.fcMoy(), req.fcMax(),
        req.dureeS(), req.distanceM(), req.tempsMoy100mS(),
        req.dureeLongueurRapideS(), req.dureeMoyLongueurS(),
        req.variationDureeLongueurs(), req.totalCyclesBras(),
        req.tempsNageS(), req.tempsPauseS());
  return repo.save(seance);
}

@Transactional(readOnly = true)
public List<Natation> historique(Utilisateur user) {
  return repo.findByUtilisateurOrderByDateDesc(user);
}

@Transactional(readOnly = true)
public Optional<Natation> derniere(Utilisateur user) {
  return repo.findFirstByUtilisateurOrderByDateDesc(user);
}
}
