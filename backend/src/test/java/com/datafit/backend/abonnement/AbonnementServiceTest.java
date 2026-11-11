package com.datafit.backend.abonnement;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

// Règles de l'abonnement, testées sans base, sans serveur et sans Stripe (tout est simulé par Mockito)
class AbonnementServiceTest {

    private static final Long ID = 1L;
    private static final LocalDateTime MAINTENANT = LocalDateTime.of(2026, 11, 10, 12, 0);

    private AbonnementRepository abonnements;
    private UtilisateurRepository utilisateurs;
    private StripeService stripe;
    private AbonnementService service;

    @BeforeEach
    void preparer() {
        abonnements = mock(AbonnementRepository.class);
        utilisateurs = mock(UtilisateurRepository.class);
        stripe = mock(StripeService.class);
        service = new AbonnementService(abonnements, utilisateurs, stripe);
    }

    private static EtatStripe etat(String periodicite, LocalDateTime fin, boolean resilie, boolean actif) {
        return new EtatStripe("sub_1", "cus_1", periodicite, fin, resilie, actif);
    }

    private Abonnement abonnement(LocalDateTime fin, boolean resilie) {
        Abonnement abo = new Abonnement(mock(Utilisateur.class), "cus_1", "sub_1",
            MAINTENANT.minusMonths(1), etat("mensuel", fin, resilie, true));
        when(abonnements.findById(ID)).thenReturn(Optional.of(abo));
        when(abonnements.findByStripeSubscriptionId("sub_1")).thenReturn(Optional.of(abo));
        return abo;
    }

    @Test
    void sansAbonnementCestLaFormuleGratuite() {
        when(abonnements.findById(ID)).thenReturn(Optional.empty());
        assertTrue(service.aJour(ID, MAINTENANT).isEmpty());
    }

    @Test
    void periodeFinieNonResilieeNestJamaisRenouveleeSansStripe() {
        Abonnement abo = abonnement(MAINTENANT.minusDays(1), false);

        assertSame(abo, service.aJour(ID, MAINTENANT).orElseThrow());
        assertEquals(MAINTENANT.minusDays(1), abo.getRenouvellement());
        verify(abonnements, never()).delete(any());
    }

    @Test
    void periodeFinieEtResilieeRepasseEnGratuit() {
        Abonnement abo = abonnement(MAINTENANT.minusDays(1), true);

        assertTrue(service.aJour(ID, MAINTENANT).isEmpty());
        verify(abonnements).delete(abo);
    }

    @Test
    void resilieMaisPeriodeEnCoursGardeLAcces() {
        abonnement(MAINTENANT.plusDays(10), true);

        assertTrue(service.aJour(ID, MAINTENANT).isPresent());
        verify(abonnements, never()).delete(any());
    }

    @Test
    void paiementDemandeAvecLePrixChoisiCoteServeur() {
        Utilisateur utilisateur = mock(Utilisateur.class);
        when(utilisateur.getEmail()).thenReturn("a@b.fr");
        when(utilisateurs.findById(ID)).thenReturn(Optional.of(utilisateur));
        when(abonnements.findById(ID)).thenReturn(Optional.empty());
        when(stripe.creerPagePaiement(ID, "a@b.fr", "annuel")).thenReturn("https://checkout.stripe.com/x");

        assertEquals("https://checkout.stripe.com/x", service.paiement(ID, "annuel"));
    }

    @Test
    void onNePeutPasPayerDeuxFois() {
        when(utilisateurs.findById(ID)).thenReturn(Optional.of(mock(Utilisateur.class)));
        abonnement(LocalDateTime.now().plusDays(10), false);

        assertThrows(IllegalStateException.class, () -> service.paiement(ID, "annuel"));
        verify(stripe, never()).creerPagePaiement(any(), anyString(), anyString());
    }

    @Test
    void portailSansAbonnementEstRefuse() {
        when(abonnements.findById(ID)).thenReturn(Optional.empty());
        assertThrows(NoSuchElementException.class, () -> service.portail(ID));
    }

    @Test
    void paiementValideCreeLAbonnement() {
        when(utilisateurs.findById(ID)).thenReturn(Optional.of(mock(Utilisateur.class)));
        when(abonnements.findById(ID)).thenReturn(Optional.empty());

        service.paiementValide(ID, etat("annuel", MAINTENANT.plusYears(1), false, true));

        verify(abonnements).save(any(Abonnement.class));
    }

    @Test
    void paiementValideRecuDeuxFoisNeCreePasDeDoublon() {
        Abonnement abo = abonnement(MAINTENANT.plusMonths(1), false);
        when(utilisateurs.findById(ID)).thenReturn(Optional.of(mock(Utilisateur.class)));

        service.paiementValide(ID, etat("annuel", MAINTENANT.plusYears(1), false, true));

        verify(abonnements, never()).save(any());
        assertEquals("annuel", abo.getPeriodicite());
    }

    @Test
    void resiliationDansLePortailEstRecopiee() {
        Abonnement abo = abonnement(MAINTENANT.plusMonths(1), false);

        service.synchroniser(etat("mensuel", MAINTENANT.plusMonths(1), true, true));

        assertTrue(abo.isResilie());
    }

    @Test
    void abonnementTermineChezStripeRepasseEnGratuit() {
        Abonnement abo = abonnement(MAINTENANT.plusMonths(1), true);

        service.synchroniser(etat("mensuel", MAINTENANT, true, false));

        verify(abonnements).delete(abo);
    }
}
