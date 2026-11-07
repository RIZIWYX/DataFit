package com.datafit.backend.montre.graphiques;

import com.datafit.backend.montre.cardio.CardioRepository;
import com.datafit.backend.montre.velo.VeloRepository;
import com.datafit.backend.montre.natation.SeanceNatationRepository;
import com.datafit.backend.montre.muscu.MuscuRepository;
import com.datafit.backend.montre.sommeil.SommeilRepository;
import com.datafit.backend.montre.client.AnalyseClient;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import tools.jackson.databind.json.JsonMapper;
import java.time.LocalDate;
import java.util.*;

@RestController
@Transactional(readOnly = true)
public class GraphiquesController {
    private final ArchivesMesures archives;
    private final CardioRepository cardio;
    private final VeloRepository velo;
    private final SeanceNatationRepository natation;
    private final MuscuRepository muscu;
    private final SommeilRepository sommeil;
    private final UtilisateurRepository utilisateurs;
    private final AnalyseClient analyse;
    private final JsonMapper json;

    public GraphiquesController(ArchivesMesures archives, CardioRepository cardio, VeloRepository velo,
            SeanceNatationRepository natation, MuscuRepository muscu, SommeilRepository sommeil,
            UtilisateurRepository utilisateurs, AnalyseClient analyse, JsonMapper json) {
        this.archives = archives; this.cardio = cardio; this.velo = velo;
        this.natation = natation; this.muscu = muscu; this.sommeil = sommeil; this.utilisateurs = utilisateurs;
        this.analyse = analyse; this.json = json;
    }

    @GetMapping("/api/seances/{sport}/{utilisateurId}/{seanceId}/graphiques")
    public ResponseEntity<Object> seance(@PathVariable String sport, @PathVariable Long utilisateurId,
            @PathVariable Long seanceId) {
        // Vérifier aussi la BDD : pas de fichier orphelin, supprimé ou d'un autre utilisateur.
        Long proprietaire = switch (sport) {
            case "cardio" -> cardio.findById(seanceId).orElseThrow().getUtilisateur().getId();
            case "velo" -> velo.findById(seanceId).orElseThrow().getUtilisateur().getId();
            case "natation" -> natation.findById(seanceId).orElseThrow().getUtilisateur().getId();
            case "muscu" -> muscu.findById(seanceId).orElseThrow().getUtilisateur().getId();
            default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        };
        if (!proprietaire.equals(utilisateurId)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return archives.lireGraphiques(sport, utilisateurId, seanceId)
                .map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    // Les graphiques d'une nuit (FC, mouvements, phases), calculés à la synchronisation.
    // 204 : nuit enregistrée avant la conservation des mesures.
    @GetMapping("/api/sommeil/{utilisateurId}/{nuitId}/graphiques")
    public ResponseEntity<Object> nuit(@PathVariable Long utilisateurId, @PathVariable Long nuitId) {
        Long proprietaire = sommeil.findById(nuitId).orElseThrow().getUtilisateur().getId();
        if (!proprietaire.equals(utilisateurId)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return archives.lireGraphiques("sommeil", utilisateurId, nuitId)
                .map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    // L'évolution des nuits (durée, efficacité, FC…), depuis les valeurs de la table sommeil.
    @GetMapping("/api/sommeil/{utilisateurId}/graphiques")
    @SuppressWarnings("unchecked")
    public Object nuits(@PathVariable Long utilisateurId, @RequestParam(defaultValue = "520") int semaines) {
        if (semaines < 1 || semaines > 520)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Période invalide.");
        var user = utilisateurs.findById(utilisateurId).orElseThrow();
        LocalDate debut = LocalDate.now().minusWeeks(semaines).plusDays(1);
        List<Map<String, Object>> lignes = new ArrayList<>();
        // de la plus ancienne à la plus récente ; une nuit est datée du jour du réveil
        List<com.datafit.backend.montre.sommeil.Sommeil> liste =
                new ArrayList<>(sommeil.findByUtilisateurOrderByHeureCoucherDesc(user));
        Collections.reverse(liste);
        for (var n : liste) {
            LocalDate date = n.getHeureReveil().toLocalDate();
            if (date.isBefore(debut)) continue;
            Map<String, Object> ligne = new LinkedHashMap<>(json.convertValue(n, Map.class));
            ligne.put("sport", "sommeil");
            ligne.put("date", date.toString());
            ligne.put("nom", "Nuit");
            lignes.add(ligne);
        }
        return analyse.progression(Map.of("seances", lignes));
    }

    @GetMapping("/api/graphiques/progression/{utilisateurId}")
    public Object progression(@PathVariable Long utilisateurId,
            @RequestParam(defaultValue = "tous") String sport,
            @RequestParam(defaultValue = "13") int semaines) {
        if (!Set.of("tous", "cardio", "velo", "natation", "muscu").contains(sport)
                || semaines < 1 || semaines > 520)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Filtre de progression invalide.");
        var user = utilisateurs.findById(utilisateurId).orElseThrow();
        List<Map<String, Object>> lignes = new ArrayList<>();
        if (sport.equals("tous") || sport.equals("cardio")) ajouter(lignes, cardio.findByUtilisateurOrderByDateDesc(user), "cardio");
        if (sport.equals("tous") || sport.equals("velo")) ajouter(lignes, velo.findByUtilisateurOrderByDateDesc(user), "velo");
        if (sport.equals("tous") || sport.equals("natation")) ajouter(lignes, natation.findByUtilisateurOrderByDateDesc(user), "natation");
        if (sport.equals("tous") || sport.equals("muscu")) ajouter(lignes, muscu.findByUtilisateurOrderByDateDesc(user), "muscu");
        LocalDate aujourdHui = LocalDate.now();
        LocalDate debut = aujourdHui.minusWeeks(semaines).plusDays(1);
        lignes.removeIf(l -> {
            LocalDate date = LocalDate.parse(l.get("date").toString());
            return date.isBefore(debut) || date.isAfter(aujourdHui);
        });
        return analyse.progression(Map.of("seances", lignes));
    }

    @SuppressWarnings("unchecked")
    private void ajouter(List<Map<String, Object>> lignes, List<?> seances, String sport) {
        for (Object s : seances) {
            Map<String, Object> ligne = new LinkedHashMap<>(json.convertValue(s, Map.class));
            ligne.put("sport", sport);
            lignes.add(ligne);
        }
    }
}
