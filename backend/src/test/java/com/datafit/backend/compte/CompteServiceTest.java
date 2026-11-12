package com.datafit.backend.compte;

import com.datafit.backend.abonnement.AbonnementRepository;
import com.datafit.backend.abonnement.PaiementIndisponibleException;
import com.datafit.backend.abonnement.StripeService;
import com.datafit.backend.montre.graphiques.ArchivesMesures;
import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

// Suppression du compte, testée sans base, sans serveur et sans Stripe (simulés par Mockito).
// Le mot de passe, lui, est vraiment haché et vérifié avec BCrypt, comme en vrai.
class CompteServiceTest {

    private static final Long ID = 1L;
    private static final String MOT_DE_PASSE = "motdepasse-123";

    private final PasswordEncoder encodeur = new BCryptPasswordEncoder();
    private UtilisateurRepository utilisateurs;
    private AbonnementRepository abonnements;
    private StripeService stripe;
    private ArchivesMesures archives;
    private CompteService service;
    private Utilisateur utilisateur;

    @BeforeEach
    void preparer() {
        utilisateurs = mock(UtilisateurRepository.class);
        abonnements = mock(AbonnementRepository.class);
        stripe = mock(StripeService.class);
        archives = mock(ArchivesMesures.class);
        service = new CompteService(utilisateurs, abonnements, stripe, archives, encodeur);

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
}
