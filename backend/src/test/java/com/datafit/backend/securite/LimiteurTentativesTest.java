package com.datafit.backend.securite;

import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.*;

class LimiteurTentativesTest {

    private static final Duration DIX_MINUTES = Duration.ofMinutes(10);

    private final AtomicLong maintenant = new AtomicLong(1_000_000);
    private final LimiteurTentatives limiteur = new LimiteurTentatives(maintenant::get);

    @Test
    void bloqueApresLeNombreMaxEtRepartApresLaFenetre() {
        for (int i = 0; i < 3; i++) assertTrue(limiteur.autoriser("a", 3, DIX_MINUTES));
        assertFalse(limiteur.autoriser("a", 3, DIX_MINUTES));

        maintenant.addAndGet(DIX_MINUTES.toMillis());
        assertTrue(limiteur.autoriser("a", 3, DIX_MINUTES));
    }

    @Test
    void unEssaiRefuseNeProlongePasLeBlocage() {
        assertTrue(limiteur.autoriser("a", 1, DIX_MINUTES));
        maintenant.addAndGet(DIX_MINUTES.toMillis() - 1);
        assertFalse(limiteur.autoriser("a", 1, DIX_MINUTES));
        maintenant.addAndGet(1);
        assertTrue(limiteur.autoriser("a", 1, DIX_MINUTES));
    }

    @Test
    void lesClesSontIndependantes() {
        assertTrue(limiteur.autoriser("a", 1, DIX_MINUTES));
        assertFalse(limiteur.autoriser("a", 1, DIX_MINUTES));
        assertTrue(limiteur.autoriser("b", 1, DIX_MINUTES));
    }

    @Test
    void compterNoterEtOublier() {
        assertEquals(0, limiteur.compter("echecs:x", DIX_MINUTES));
        limiteur.noter("echecs:x");
        limiteur.noter("echecs:x");
        assertEquals(2, limiteur.compter("echecs:x", DIX_MINUTES));

        maintenant.addAndGet(DIX_MINUTES.toMillis());
        assertEquals(0, limiteur.compter("echecs:x", DIX_MINUTES));

        limiteur.noter("echecs:x");
        limiteur.oublier("echecs:x");
        assertEquals(0, limiteur.compter("echecs:x", DIX_MINUTES));
    }
}
