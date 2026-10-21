package com.datafit.backend.seance.velo;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class VeloService {
private final VeloRepository repo;

public VeloService(VeloRepository repo) {
  this.repo = repo;
}

// Enregistre une seance velo (plusieurs par jour autorisees).
public Velo valider(Utilisateur user, VeloRequest req) {
  Velo seance = new Velo(
        user, req.nom(),
        req.fcMin(), req.fcMoy(), req.fcMax(),
        req.correlationFcVitesse(), req.dureeS(),
        req.tempsPedalageS(), req.tempsRoueLibreS(), req.tempsPauseS(),
        req.distanceM(), req.vitesseMoyKmh(), req.vitesseMaxKmh(),
        req.variationVitesse());
  return repo.save(seance);
}

@Transactional(readOnly = true)
public List<Velo> historique(Utilisateur user) {
  return repo.findByUtilisateurOrderByDateDesc(user);
}

@Transactional(readOnly = true)
public Optional<Velo> derniere(Utilisateur user) {
  return repo.findFirstByUtilisateurOrderByDateDesc(user);
}
}
