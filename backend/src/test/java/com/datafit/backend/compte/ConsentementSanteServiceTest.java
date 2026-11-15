package com.datafit.backend.compte;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// Le consentement aux données de santé, testé sans base (le dépôt est simulé).
class ConsentementSanteServiceTest {

    private UtilisateurRepository utilisateurs;
    private ConsentementSanteService service;
    private Utilisateur utilisateur;

    @BeforeEach
    void preparer() {
        utilisateurs = mock(UtilisateurRepository.class);
        service = new ConsentementSanteService(utilisateurs);
        utilisateur = new Utilisateur("a@b.fr", "hache");
        when(utilisateurs.findById(1L)).thenReturn(Optional.of(utilisateur));
        when(utilisateurs.save(any(Utilisateur.class))).thenAnswer(a -> a.getArgument(0));
    }

    @Test
    void unCompteSansConsentementRenvoieVide() {
        assertTrue(service.lire(1L).isEmpty());
    }

    @Test
    void accepterNoteLaDate() {
        LocalDateTime avant = LocalDateTime.now().minusSeconds(1);

        LocalDateTime date = service.accepter(1L);

        assertTrue(date.isAfter(avant));
        assertEquals(Optional.of(date), service.lire(1L));
        verify(utilisateurs).save(utilisateur);
    }

    @Test
    void unConsentementDejaDonneGardeSaDateDOrigine() {
        LocalDateTime premiere = service.accepter(1L);
        assertEquals(premiere, service.accepter(1L));
    }

    @Test
    void uncompteInconnuEstUneErreur404() {
        assertThrows(NoSuchElementException.class, () -> service.lire(99L));
        assertThrows(NoSuchElementException.class, () -> service.accepter(99L));
    }
}
