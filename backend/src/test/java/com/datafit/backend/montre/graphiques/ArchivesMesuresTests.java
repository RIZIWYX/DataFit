package com.datafit.backend.montre.graphiques;

import com.datafit.backend.montre.client.AnalyseClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import tools.jackson.databind.json.JsonMapper;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ArchivesMesuresTests {
    @TempDir Path dossier;

    @Test void relevesPersistantsEtIsolesParUtilisateur() {
        AnalyseClient analyse = mock(AnalyseClient.class);
        Object mesures = Map.of("sport", "cardio", "mesures", List.of(Map.of("heart_rate", 123)));
        when(analyse.graphiques(mesures)).thenReturn(Map.of("version", 1, "graphiques", List.of()));
        JsonMapper json = JsonMapper.builder().build();
        new ArchivesMesures(dossier.toString(), json, analyse).enregistrer("cardio", 7L, 1L, mesures);
        // Une nouvelle instance représente un redémarrage du backend, sans cache mémoire.
        ArchivesMesures apresRedemarrage = new ArchivesMesures(dossier.toString(), json, analyse);
        assertTrue(apresRedemarrage.lireGraphiques("cardio", 7L, 1L).isPresent());
        assertTrue(apresRedemarrage.lireGraphiques("cardio", 8L, 1L).isEmpty());
        assertTrue(apresRedemarrage.lireGraphiques("velo", 7L, 1L).isEmpty());
        assertThrows(IllegalArgumentException.class, () -> apresRedemarrage.lireGraphiques("../cardio", 7L, 1L));
    }

    @Test void uneTransactionAnnuleeNeConservePasSonArchive() {
        AnalyseClient analyse = mock(AnalyseClient.class);
        Object mesures = Map.of("sport", "velo");
        when(analyse.graphiques(mesures)).thenReturn(Map.of("version", 1, "graphiques", List.of()));
        ArchivesMesures archives = new ArchivesMesures(dossier.toString(), JsonMapper.builder().build(), analyse);
        TransactionSynchronizationManager.initSynchronization();
        try {
            archives.enregistrer("velo", 7L, 2L, mesures);
            assertTrue(archives.lireGraphiques("velo", 7L, 2L).isPresent());
            for (var synchronisation : TransactionSynchronizationManager.getSynchronizations())
                synchronisation.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK);
            assertTrue(archives.lireGraphiques("velo", 7L, 2L).isEmpty());
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }
}
