package com.datafit.backend.seance.muscu;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MuscuService {
private final MuscuRepository repo;

public MuscuService(MuscuRepository repo) {
  this.repo = repo;
}

// Enregistre une seance muscu (plusieurs par jour autorisees).
public Muscu valider(Utilisateur user, MuscuRequest req) {
  Muscu seance = new Muscu(
        user, req.nom(),
        req.fcMin(), req.fcMoy(), req.fcMax(),
        req.fcMoyEffort(), req.fcMoyPause(),
        req.dureeS(), req.dureeEffortS(), req.dureePauseS(),
        req.nbSeries(), req.dureeMoyPauseS(), req.baisseFcApres60s());
  return repo.save(seance);
}

@Transactional(readOnly = true)
public List<Muscu> historique(Utilisateur user) {
  return repo.findByUtilisateurOrderByDateDesc(user);
}

@Transactional(readOnly = true)
public Optional<Muscu> derniere(Utilisateur user) {
  return repo.findFirstByUtilisateurOrderByDateDesc(user);
}
}
