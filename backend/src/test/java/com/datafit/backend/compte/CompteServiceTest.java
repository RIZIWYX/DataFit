package com.datafit.backend.compte;

import com.datafit.backend.abonnement.AbonnementRepository;
import com.datafit.backend.abonnement.PaiementIndisponibleException;
import com.datafit.backend.abonnement.StripeService;
import com.datafit.backend.montre.graphiques.ArchivesMesures;
import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.EnumSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

// Suppression du compte et « Effacer mes données », testées sans base, sans serveur et sans Stripe
// (simulés par Mockito).
// Le mot de passe, lui, est vraiment haché et vérifié avec BCrypt, comme en vrai.
class CompteServiceTest {

    private static final Long ID = 1L;
    private static final String MOT_DE_PASSE = "motdepasse-123";

    private final PasswordEncoder encodeur = new BCryptPasswordEncoder();
    private UtilisateurRepository utilisateurs;
    private AbonnementRepository abonnements;
    private StripeService stripe;
    private ArchivesMesures archives;
    private JdbcTemplate jdbc;
    private CompteService service;
    private Utilisateur utilisateur;

    @BeforeEach
    void preparer() {
        utilisateurs = mock(UtilisateurRepository.class);
        abonnements = mock(AbonnementRepository.class);
        stripe = mock(StripeService.class);
        archives = mock(ArchivesMesures.class);
        jdbc = mock(JdbcTemplate.class);
        service = new CompteService(utilisateurs, abonnements, stripe, archives, encodeur, jdbc);

        utilisateur = new Utilisateur("a@b.fr", encodeur.encode(MOT_DE_PASSE));
        when(utilisateurs.findById(ID)).thenReturn(Optional.of(utilisateur));
        when(abonnements.trouverIdStripe(ID)).thenReturn(Optional.empty());
    }

    // une ligne d'abonnement pour le compte, avec cet identifiant Stripe (vide : abonnement sans Stripe)
    private void abonnementStripe(String subscriptionId) {
        when(abonnements.trouverIdStripe(ID)).thenReturn(Optional.of(subscriptionId));
    }

    @Test
    void leBonMotDePasseSupprimeLeCompteEtSesMesures() {
        service.supprimer(ID, MOT_DE_PASSE);

        verify(utilisateurs).delete(utilisateur);
        verify(archives).supprimerCompte(ID);
        verify(stripe, never()).arreterAbonnement(anyString());
    }

    @Test
    void unMauvaisMotDePasseNeSupprimeRien() {
        assertThrows(MotDePasseIncorrectException.class, () -> service.supprimer(ID, "pas-le-bon"));

        verify(utilisateurs, never()).delete(any());
        verify(archives, never()).supprimerCompte(anyLong());
        verify(stripe, never()).arreterAbonnement(anyString());
    }

    @Test
    void unCompteInconnuEstRefuse() {
        when(utilisateurs.findById(ID)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.supprimer(ID, MOT_DE_PASSE));
        verify(utilisateurs, never()).delete(any());
    }

    @Test
    void lAbonnementStripeEstArreteAvantDEffacerLeCompte() {
        abonnementStripe("sub_1");

        service.supprimer(ID, MOT_DE_PASSE);

        InOrder ordre = inOrder(stripe, utilisateurs);
        ordre.verify(stripe).arreterAbonnement("sub_1");
        ordre.verify(utilisateurs).delete(utilisateur);
    }

    @Test
    void siStripeNeRepondPasLeCompteResteEnPlace() {
        abonnementStripe("sub_1");
        doThrow(new PaiementIndisponibleException("Stripe indisponible", null))
            .when(stripe).arreterAbonnement("sub_1");

        assertThrows(PaiementIndisponibleException.class, () -> service.supprimer(ID, MOT_DE_PASSE));
        verify(utilisateurs, never()).delete(any());
        verify(archives, never()).supprimerCompte(anyLong());
    }

    @Test
    void unAbonnementSansStripeNAppellePasStripe() {
        abonnementStripe("");

        service.supprimer(ID, MOT_DE_PASSE);

        verify(stripe, never()).arreterAbonnement(anyString());
        verify(utilisateurs).delete(utilisateur);
    }

    // --- Effacer mes données ---

    @Test
    void effacerLesSeancesVideLeursTablesEtLeursMesures() {
        service.effacerDonnees(ID, MOT_DE_PASSE, Set.of(CategorieDonnees.SEANCES));

        for (String table : List.of("seance_cardio", "seance_velo", "seance_natation", "seance_muscu")) {
            verify(jdbc).update("DELETE FROM " + table + " WHERE utilisateur_id = ?", ID);
        }
        verify(archives).supprimerMesures(ID, List.of("cardio", "velo", "natation", "muscu"));
        verifyNoMoreInteractions(jdbc);
        // le compte reste
        verify(utilisateurs, never()).delete(any());
        verify(archives, never()).supprimerCompte(anyLong());
    }

    @Test
    void effacerToutNeTouchePasAuProfilNiALAbonnement() {
        service.effacerDonnees(ID, MOT_DE_PASSE, EnumSet.allOf(CategorieDonnees.class));

        ArgumentCaptor<String> requetes = ArgumentCaptor.forClass(String.class);
        verify(jdbc, atLeastOnce()).update(requetes.capture(), eq(ID));
        for (String requete : requetes.getAllValues()) {
            assertFalse(requete.contains(" profil ") || requete.contains(" abonnement ") || requete.contains(" utilisateur "),
                "ne doit jamais effacer le compte, le profil ni l'abonnement : " + requete);
        }
        verify(utilisateurs, never()).delete(any());
        verify(stripe, never()).arreterAbonnement(anyString());
    }

    @Test
    void unMauvaisMotDePasseNEffaceAucuneDonnee() {
        assertThrows(MotDePasseIncorrectException.class,
            () -> service.effacerDonnees(ID, "pas-le-bon", EnumSet.allOf(CategorieDonnees.class)));

        verifyNoInteractions(jdbc);
        verify(archives, never()).supprimerMesures(anyLong(), any());
    }

    @Test
    void effacerPourUnCompteInconnuEstRefuse() {
        when(utilisateurs.findById(ID)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class,
            () -> service.effacerDonnees(ID, MOT_DE_PASSE, Set.of(CategorieDonnees.NUTRITION)));
        verifyNoInteractions(jdbc);
    }
}
