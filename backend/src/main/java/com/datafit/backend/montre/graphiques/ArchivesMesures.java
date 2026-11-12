package com.datafit.backend.montre.graphiques;

import com.datafit.backend.montre.client.AnalyseClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import tools.jackson.databind.json.JsonMapper;
import java.nio.file.*;
import java.io.IOException;
import java.util.Comparator;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

/** Conservation des relevés et des séries graphiques sans modifier le schéma SQL. */
@Service
public class ArchivesMesures {
    private static final Logger journal = LoggerFactory.getLogger(ArchivesMesures.class);
    private static final Set<String> SPORTS = Set.of("cardio", "velo", "natation", "muscu", "sommeil");
    private final Path racine;
    private final JsonMapper json;
    private final AnalyseClient analyse;

    public ArchivesMesures(@Value("${montre.mesures.dir:./donnees-montre}") String dossier,
            JsonMapper json, AnalyseClient analyse) {
        this.racine = Path.of(dossier).toAbsolutePath().normalize();
        this.json = json;
        this.analyse = analyse;
    }

    private Path chemin(String sport, Long utilisateur, Long seance) {
        if (!SPORTS.contains(sport) || utilisateur == null || utilisateur <= 0 || seance == null || seance <= 0)
            throw new IllegalArgumentException("Identifiants de mesures invalides.");
        return racine.resolve(utilisateur.toString()).resolve(sport).resolve(seance + ".json");
    }

    public void enregistrer(String sport, Long utilisateur, Long seance, Object mesures) {
        // Les graphiques sont calculés sur le même JSON que le résumé sauvegardé en BDD.
        Object graphiques = analyse.graphiques(mesures);
        if (graphiques == null) throw new IllegalStateException("L’analyse n’a renvoyé aucun graphique.");
        Path cible = chemin(sport, utilisateur, seance);
        Path temporaire = null;
        try {
            Files.createDirectories(cible.getParent());
            temporaire = Files.createTempFile(cible.getParent(), "mesures-", ".tmp");
            Files.write(temporaire, json.writeValueAsBytes(Map.of("simulation", mesures, "graphiques", graphiques)));
            try {
                Files.move(temporaire, cible, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
            } catch (AtomicMoveNotSupportedException e) {
                Files.move(temporaire, cible, StandardCopyOption.REPLACE_EXISTING);
            }
            // Une transaction SQL annulée ne doit pas laisser une archive attribuable à un futur id.
            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override public void afterCompletion(int statut) {
                        if (statut != STATUS_COMMITTED) supprimer(sport, utilisateur, seance);
                    }
                });
            }
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de conserver les mesures de la séance.", e);
        } finally {
            if (temporaire != null) try { Files.deleteIfExists(temporaire); } catch (IOException ignore) { }
        }
    }

    public Optional<Object> lireGraphiques(String sport, Long utilisateur, Long seance) {
        Path fichier = chemin(sport, utilisateur, seance);
        if (!Files.isRegularFile(fichier)) return Optional.empty();
        try {
            Map<?, ?> archive = json.readValue(Files.readAllBytes(fichier), Map.class);
            return Optional.ofNullable(archive.get("graphiques"));
        } catch (IOException | RuntimeException e) {
            throw new IllegalStateException("Impossible de lire les mesures conservées.", e);
        }
    }

    void supprimer(String sport, Long utilisateur, Long seance) {
        try { Files.deleteIfExists(chemin(sport, utilisateur, seance)); }
        catch (IOException e) { throw new IllegalStateException("Impossible de supprimer une archive annulée.", e); }
    }

    // Compte supprimé : toutes ses mesures (le dossier <racine>/<utilisateur>/, tous sports confondus)
    // sont effacées une fois la suppression validée en base. Si elle est annulée, elles restent.
    public void supprimerCompte(Long utilisateur) {
        if (utilisateur == null || utilisateur <= 0)
            throw new IllegalArgumentException("Identifiant de compte invalide.");
        Path dossier = racine.resolve(utilisateur.toString());
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            effacerDossier(dossier);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                // le compte est déjà effacé en base : une erreur ici ne doit pas faire croire à
                // l'utilisateur que la suppression a échoué, on la note pour la corriger à la main
                try { effacerDossier(dossier); }
                catch (IllegalStateException e) { journal.error("Compte {} supprimé, mais pas ses mesures ({})", utilisateur, dossier, e); }
            }
        });
    }

    private static void effacerDossier(Path dossier) {
        if (!Files.exists(dossier)) return;
        try (Stream<Path> chemins = Files.walk(dossier)) {
            // les fichiers d'abord, puis les dossiers qui les contenaient
            for (Path chemin : chemins.sorted(Comparator.reverseOrder()).toList()) Files.delete(chemin);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible d'effacer les mesures du compte.", e);
        }
    }
}
