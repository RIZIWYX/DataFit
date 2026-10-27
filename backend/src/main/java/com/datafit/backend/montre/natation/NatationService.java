package com.datafit.backend.montre.natation;

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

// Nom de bean explicite pour ne pas entrer en conflit avec
// sport.natation.NatationService.
@Service("seanceNatationService")
@Transactional
public class NatationService {

  private static final String TYPE = "natation";

  private final SeanceNatationRepository repo;
  private final ProfilRepository profilRepo;
  private final SimulateurClient simulateur;
  private final AnalyseClient analyse;

  public NatationService(SeanceNatationRepository repo, ProfilRepository profilRepo,
      SimulateurClient simulateur, AnalyseClient analyse) {
    this.repo = repo;
    this.profilRepo = profilRepo;
    this.simulateur = simulateur;
    this.analyse = analyse;
  }

  public Natation valider(Utilisateur user, NatationRequest req) {
    Profil profil = profilRepo.findById(user.getId())
        .orElseThrow(() -> new IllegalStateException("L'utilisateur n'a pas de profil."));

    DemandeSimulation demande = new DemandeSimulation(
        new ProfilSimulation(user.getId(), profil.getSexe(), profil.getPoids(),
            profil.getTaille(), profil.getNiveau(), profil.getDateNaissance()),
        new SeanceSimulation(TYPE, req.nom(), LocalDate.now()));

    Object mesures = simulateur.simuler(demande);
    ResultatNatation r = analyse.analyser(mesures, ResultatNatation.class);

    Natation seance = new Natation(user, req.nom(),
        r.fcMin(), r.fcMoy(), r.fcMax(), r.dureeS(), r.distanceM(),
        r.tempsMoy100mS(), r.dureeLongueurRapideS(), r.dureeMoyLongueurS(),
        r.variationDureeLongueurs(), r.totalCyclesBras(),
        r.tempsNageS(), r.tempsPauseS());
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
