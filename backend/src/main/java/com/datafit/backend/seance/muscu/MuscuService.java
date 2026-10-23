package com.datafit.backend.seance.muscu;

import com.datafit.backend.profil.Profil;
import com.datafit.backend.profil.ProfilRepository;
import com.datafit.backend.seance.client.AnalyseClient;
import com.datafit.backend.seance.client.DemandeSimulation;
import com.datafit.backend.seance.client.ProfilSimulation;
import com.datafit.backend.seance.client.SeanceSimulation;
import com.datafit.backend.seance.client.SimulateurClient;
import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MuscuService {

private static final String TYPE = "muscu";

private final MuscuRepository repo;
private final ProfilRepository profilRepo;
private final SimulateurClient simulateur;
private final AnalyseClient analyse;

public MuscuService(MuscuRepository repo, ProfilRepository profilRepo,
    SimulateurClient simulateur, AnalyseClient analyse) {
  this.repo = repo;
  this.profilRepo = profilRepo;
  this.simulateur = simulateur;
  this.analyse = analyse;
}

public Muscu valider(Utilisateur user, MuscuRequest req) {
  Profil profil = profilRepo.findById(user.getId())
      .orElseThrow(() -> new IllegalStateException("L'utilisateur n'a pas de profil."));

  DemandeSimulation demande = new DemandeSimulation(
        new ProfilSimulation(user.getId(), profil.getSexe(), profil.getPoids(),
              profil.getTaille(), profil.getNiveau(), profil.getDateNaissance()),
        new SeanceSimulation(TYPE, req.nom(), LocalDate.now()));

  Object mesures = simulateur.simuler(demande);
  ResultatMuscu r = analyse.analyser(mesures, ResultatMuscu.class);

  Muscu seance = new Muscu(user, req.nom(),
        r.fcMin(), r.fcMoy(), r.fcMax(), r.fcMoyEffort(), r.fcMoyPause(),
        r.dureeS(), r.dureeEffortS(), r.dureePauseS(),
        r.nbSeries(), r.dureeMoyPauseS(), r.baisseFcApres60s());
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
