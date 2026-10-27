package com.datafit.backend.sommeil;

import com.datafit.backend.profil.Profil;
import com.datafit.backend.profil.ProfilRepository;
import com.datafit.backend.sommeil.client.AnalyseClientSommeil;
import com.datafit.backend.sommeil.client.DemandeSimulationSommeil;
import com.datafit.backend.sommeil.client.ProfilSimulationSommeil;
import com.datafit.backend.sommeil.client.SimulateurClientSommeil;
import com.datafit.backend.sommeil.client.SimulationSommeil;
import com.datafit.backend.utilisateur.Utilisateur;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class SommeilService {
    private final SommeilRepository repo;

    private final ProfilRepository profilRepo;
    private final SimulateurClientSommeil simulateur;
    private final AnalyseClientSommeil analyse;
    // applique les règles de SommeilRequest (@NotNull, @PositiveOrZero…) aux
    // valeurs de l'analyse
    private final Validator validateur;

    public SommeilService(SommeilRepository repo,
            ProfilRepository profilRepo,
            SimulateurClientSommeil simulateur, AnalyseClientSommeil analyse,
            Validator validateur) {
        this.repo = repo;
        this.profilRepo = profilRepo;
        this.simulateur = simulateur;
        this.analyse = analyse;
        this.validateur = validateur;
    }

    // Analyse une nuit : simulateur -> analyse -> vérifications -> enregistrement.
    // Nuit invalide ou déjà enregistrée → IllegalStateException (409 via
    // ApiExceptionHandler).
    public Sommeil valider(Utilisateur user) {
        Profil profil = profilRepo.findById(user.getId())
                .orElseThrow(() -> new IllegalStateException("L'utilisateur n'a pas de profil."));

        DemandeSimulationSommeil demande = new DemandeSimulationSommeil(
                new ProfilSimulationSommeil(user.getId(), profil.getSexe(), profil.getPoids(),
                        profil.getTaille(), profil.getNiveau(), profil.getDateNaissance()),
                new SimulationSommeil(LocalDate.now()));

        // 1. le simulateur produit les mesures de la nuit (JSON brut)
        Object mesures = simulateur.simuler(demande);

        // 2. l'analyse calcule les 16 valeurs de la nuit
        ResultatSommeil r = analyse.analyser(mesures);
        if (r == null) {
            throw new IllegalStateException("L'analyse n'a renvoyé aucun résultat");
        }
        SommeilRequest nuit = new SommeilRequest(r.heureCoucher(), r.heureReveil(), r.tempsAuLitS(),
                r.dureeSommeilS(), r.latenceEndormissementS(), r.dureeEveilTotaleS(), r.eveilNocturneS(),
                r.reveilsNb(), r.efficaciteSommeilPct(), r.fcMoyenne(), r.fcMin(),
                r.fcMax(), r.dureeEveilS(), r.dureeLegerS(), r.dureeProfondS(),
                r.dureeParadoxalS());

        // 3. on vérifie les valeurs : @Valid ne s'applique qu'à ce qui arrive par le
        // contrôleur, pas à un SommeilRequest construit ici. Avant le test des
        // doublons : une heure de coucher absente ne doit pas arriver jusqu'à la base.
        Set<ConstraintViolation<SommeilRequest>> erreurs = validateur.validate(nuit);
        if (!erreurs.isEmpty()) {
            throw new IllegalStateException("L'analyse a renvoyé une nuit invalide : "
                    + erreurs.iterator().next().getMessage());
        }

        // 4. la même nuit (même heure de coucher) n'est pas enregistrée deux fois
        if (repo.existsByUtilisateurAndHeureCoucher(user, nuit.heureCoucher())) {
            throw new IllegalStateException("Cette nuit est déjà enregistrée");
        }

        // 5. on enregistre
        return repo.save(new Sommeil(user, nuit));
    }

    // Sans effet si la nuit n'existe plus (déjà supprimée) ou appartient à un autre
    // utilisateur.
    public void supprimer(Utilisateur user, Long id) {
        repo.deleteByIdAndUtilisateur(id, user);
    }

    // La nuit qui se termine ce jour-là (on parle de « la nuit du 21 » quand on se
    // réveille le 21)
    @Transactional(readOnly = true)
    public Optional<Sommeil> duJour(Utilisateur user, LocalDate date) {
        return repo.findFirstByUtilisateurAndHeureReveilGreaterThanEqualAndHeureReveilLessThanOrderByHeureReveilDesc(
                user, date.atStartOfDay(), date.plusDays(1).atStartOfDay());
    }

    @Transactional(readOnly = true)
    public List<Sommeil> historique(Utilisateur user) {
        return repo.findByUtilisateurOrderByHeureCoucherDesc(user);
    }
}
