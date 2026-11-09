package com.datafit.backend.hydratation;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// Règles de l'hydratation, testées sans base ni serveur (dépôts simulés par Mockito)
class HydratationServiceTest {

    private static final Long ID = 1L;
    private static final LocalDate JOUR = LocalDate.of(2026, 11, 10);

    private HydratationRepository hydratations;
    private UtilisateurRepository utilisateurs;
    private HydratationService service;

    @BeforeEach
    void preparer() {
        hydratations = mock(HydratationRepository.class);
        utilisateurs = mock(UtilisateurRepository.class);
        service = new HydratationService(hydratations, utilisateurs);
    }

    @Test
    void ajouterEnregistreLAjout() {
        when(utilisateurs.findById(ID)).thenReturn(Optional.of(mock(Utilisateur.class)));
        when(hydratations.save(any())).thenAnswer(i -> i.getArgument(0));

        Hydratation ajout = service.ajouter(ID, new HydratationRequest(JOUR, 500));

        assertEquals(JOUR, ajout.getDate());
        assertEquals(500, ajout.getMl());
    }

    @Test
    void ajouterPourUnCompteInconnuEstRefuse() {
        when(utilisateurs.findById(ID)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.ajouter(ID, new HydratationRequest(JOUR, 500)));
        verify(hydratations, never()).save(any());
    }

    @Test
    void onNeSupprimePasLEauDUnAutreCompte() {
        when(hydratations.findByIdAndUtilisateurId(7L, ID)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.supprimer(ID, 7L));
        verify(hydratations, never()).delete(any());
    }
}
