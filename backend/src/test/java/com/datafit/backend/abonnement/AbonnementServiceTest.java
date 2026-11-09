package com.datafit.backend.abonnement;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

// Règles de l'abonnement, testées sans base ni serveur (dépôts simulés par Mockito)
class AbonnementServiceTest {

    private static final Long ID = 1L;
    private static final LocalDateTime MAINTENANT = LocalDateTime.of(2026, 11, 10, 12, 0);

    private AbonnementRepository abonnements;
    private UtilisateurRepository utilisateurs;
    private AbonnementService service;

    @BeforeEach
    void preparer() {
        abonnements = mock(AbonnementRepository.class);
        utilisateurs = mock(UtilisateurRepository.class);
        service = new AbonnementService(abonnements, utilisateurs);
    }

    private Abonnement abonnement(String periodicite, LocalDateTime debut) {
        Abonnement abo = new Abonnement(mock(Utilisateur.class), periodicite, debut);
        when(abonnements.findById(ID)).thenReturn(Optional.of(abo));
        return abo;
    }

    @Test
    void finDePeriodeMensuelleEtAnnuelle() {
        assertEquals(MAINTENANT.plusMonths(1), Abonnement.finDePeriode(MAINTENANT, "mensuel"));
        assertEquals(MAINTENANT.plusYears(1), Abonnement.finDePeriode(MAINTENANT, "annuel"));
    }

    @Test
    void sansAbonnementCestLaFormuleGratuite() {
        when(abonnements.findById(ID)).thenReturn(Optional.empty());
        assertTrue(service.aJour(ID, MAINTENANT).isEmpty());
    }

    @Test
    void periodeEnCoursRienNeChange() {
        Abonnement abo = abonnement("mensuel", MAINTENANT.minusDays(10));
        LocalDateTime fin = abo.getRenouvellement();

        assertSame(abo, service.aJour(ID, MAINTENANT).orElseThrow());
        assertEquals(fin, abo.getRenouvellement());
    }

    @Test
    void periodeFinieNonResilieeSeRenouvelle() {
        // commencé il y a 3 mois et demi : renouvelé jusqu'au mois suivant
        Abonnement abo = abonnement("mensuel", MAINTENANT.minusMonths(3).minusDays(15));

        service.aJour(ID, MAINTENANT);

        assertTrue(abo.getRenouvellement().isAfter(MAINTENANT));
        assertFalse(abo.getRenouvellement().isAfter(MAINTENANT.plusMonths(1)));
        verify(abonnements, never()).delete(any());
    }

    @Test
    void periodeFinieEtResilieeRepasseEnGratuit() {
        Abonnement abo = abonnement("mensuel", MAINTENANT.minusMonths(2));
        abo.resilier();

        assertTrue(service.aJour(ID, MAINTENANT).isEmpty());
        verify(abonnements).delete(abo);
    }

    @Test
    void resilieMaisPeriodeEnCoursGardeLAcces() {
        Abonnement abo = abonnement("annuel", MAINTENANT.minusMonths(2));
        abo.resilier();

        assertTrue(service.aJour(ID, MAINTENANT).isPresent());
        verify(abonnements, never()).delete(any());
    }

    @Test
    void onNePeutPasSabonnerDeuxFois() {
        when(utilisateurs.findById(ID)).thenReturn(Optional.of(mock(Utilisateur.class)));
        abonnement("mensuel", LocalDateTime.now().minusDays(1));

        assertThrows(IllegalStateException.class, () -> service.souscrire(ID, "annuel"));
    }

    @Test
    void resilierSansAbonnementEstRefuse() {
        when(abonnements.findById(ID)).thenReturn(Optional.empty());
        assertThrows(NoSuchElementException.class, () -> service.resilier(ID));
    }
}
