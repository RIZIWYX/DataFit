package com.datafit.backend.montre.cardio;

import com.datafit.backend.montre.client.AnalyseClient;
import com.datafit.backend.montre.graphiques.ArchivesMesures;
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
public class CardioService {

  private static final String TYPE = "cardio";

  private final CardioRepository repo;
  private final ProfilRepository profilRepo;
  private final SimulateurClient simulateur;
  private final AnalyseClient analyse;
  private final ArchivesMesures archives;

  public CardioService(CardioRepository repo, ProfilRepository profilRepo,
      SimulateurClient simulateur, AnalyseClient analyse, ArchivesMesures archives) {
    this.repo = repo;
    this.profilRepo = profilRepo;
    this.simulateur = simulateur;
    this.analyse = analyse;
    this.archives = archives;
  }

  // Lance une seance : simulateur -> analyse -> enregistrement.
  public Cardio valider(Utilisateur user, CardioRequest req) {
    Profil profil = profilRepo.findById(user.getId())
        .orElseThrow(() -> new IllegalStateException("L'utilisateur n'a pas de profil."));

    DemandeSimulation demande = new DemandeSimulation(
        new ProfilSimulation(user.getId(), profil.getSexe(), profil.getPoids(),
            profil.getTaille(), profil.getNiveau(), profil.getDateNaissance()),
        new SeanceSimulation(TYPE, req.nom(), LocalDate.now()));

    // 1. le simulateur produit les mesures (JSON brut)
    Object mesures = simulateur.simuler(demande);

    // 2. l'analyse transforme les mesures en metriques
    ResultatCardio r = analyse.analyser(mesures, ResultatCardio.class);

    // 3. on enregistre
    Cardio seance = new Cardio(user, req.nom(),
        r.fcMoy(), r.fcMin(), r.fcMax(), r.correlationVitesseFc(),
        r.dureeS(), r.distanceM(), r.vitesseMoyKmh(), r.vitesseMaxKmh(),
        r.tempsMoy1kmS(), r.variationVitesse());
    seance = repo.save(seance);
    archives.enregistrer(TYPE, user.getId(), seance.getId(), mesures);
    return seance;
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
