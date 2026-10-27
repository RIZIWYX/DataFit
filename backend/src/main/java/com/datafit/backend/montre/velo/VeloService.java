package com.datafit.backend.montre.velo;

import com.datafit.backend.montre.client.AnalyseClient;
import com.datafit.backend.montre.client.DemandeSimulation;
import com.datafit.backend.montre.client.ProfilSimulation;
import com.datafit.backend.montre.client.SeanceSimulation;
import com.datafit.backend.montre.client.SimulateurClient;
import com.datafit.backend.profil.Profil;
import com.datafit.backend.profil.ProfilRepository;
import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class VeloService {

  private static final String TYPE = "velo";

  private final VeloRepository repo;
  private final ProfilRepository profilRepo;
  private final SimulateurClient simulateur;
  private final AnalyseClient analyse;

  public VeloService(VeloRepository repo, ProfilRepository profilRepo,
      SimulateurClient simulateur, AnalyseClient analyse) {
    this.repo = repo;
    this.profilRepo = profilRepo;
    this.simulateur = simulateur;
    this.analyse = analyse;
  }

  public Velo valider(Utilisateur user, VeloRequest req) {
    Profil profil = profilRepo.findById(user.getId())
        .orElseThrow(() -> new IllegalStateException("L'utilisateur n'a pas de profil."));

    DemandeSimulation demande = new DemandeSimulation(
        new ProfilSimulation(user.getId(), profil.getSexe(), profil.getPoids(),
            profil.getTaille(), profil.getNiveau(), profil.getDateNaissance()),
        new SeanceSimulation(TYPE, req.nom(), LocalDate.now()));

    Object mesures = simulateur.simuler(demande);
    ResultatVelo r = analyse.analyser(mesures, ResultatVelo.class);

    Velo seance = new Velo(user, req.nom(),
        r.fcMin(), r.fcMoy(), r.fcMax(), r.correlationFcVitesse(), r.dureeS(),
        r.tempsPedalageS(), r.tempsRoueLibreS(), r.tempsPauseS(),
        r.distanceM(), r.vitesseMoyKmh(), r.vitesseMaxKmh(), r.variationVitesse());
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
