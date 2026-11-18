package com.datafit.backend.sport.calisthenics;

import com.datafit.backend.utilisateur.Utilisateur;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// Les perfs Calisthenics, testées sans base : le dépôt est simulé.
// Surtout la tenue libre en handstand (en secondes), ajoutée à côté de l'échelle des HSPU.
class CalisthenicsServiceTest {

    private final Validator validateur = Validation.buildDefaultValidatorFactory().getValidator();
    private CalisthenicsRepository repo;
    private CalisthenicsService service;
    private Utilisateur utilisateur;

    @BeforeEach
    void preparer() {
        repo = mock(CalisthenicsRepository.class);
        when(repo.save(any(Calisthenics.class))).thenAnswer(a -> a.getArgument(0));
        service = new CalisthenicsService(repo);
        utilisateur = new Utilisateur("a@b.fr", "hache");
    }

    private static CalisthenicsRequest demande(Double handstandTenue) {
        return new CalisthenicsRequest(10.0, 12.0, 30.0, 1.0, 5.0, 20.0, 3.0, 2.0, 1.0, 1.0, 1.0, 1.0, handstandTenue);
    }

    @Test
    void valideEnregistreLaTenueEtLEtapeDesHspuSeparement() {
        Calisthenics c = service.valider(utilisateur, demande(25.0));

        assertEquals(25.0, c.getHandstandTenue(), "la tenue libre, en secondes");
        assertEquals(3.0, c.getHandstand(), "l'étape de l'échelle des HSPU, inchangée");
    }

    @Test
    void uneTenueAbsenteCompteZeroSeconde() {
        assertEquals(0.0, service.valider(utilisateur, demande(null)).getHandstandTenue());
    }

    @Test
    void modifierCorrigeLaTenueDuJour() {
        Calisthenics existante = new Calisthenics(utilisateur, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5);
        when(repo.findByUtilisateurAndDate(utilisateur, LocalDate.now())).thenReturn(Optional.of(existante));

        Calisthenics c = service.modifierCelleDuJour(utilisateur, demande(40.0));

        assertEquals(40.0, c.getHandstandTenue());
    }

    @Test
    void refuseUneDeuxiemeSeanceLeMemeJour() {
        when(repo.findByUtilisateurAndDate(utilisateur, LocalDate.now()))
            .thenReturn(Optional.of(new Calisthenics(utilisateur, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0)));

        assertThrows(IllegalStateException.class, () -> service.valider(utilisateur, demande(10.0)));
        verify(repo, never()).save(any());
    }

    @Test
    void laValidationAccepteZeroEtAbsentMaisPasUneTenueNegative() {
        assertTrue(validateur.validate(demande(0.0)).isEmpty(), "0 : pas encore de tenue");
        assertTrue(validateur.validate(demande(null)).isEmpty(), "absente : ancien client");
        assertTrue(validateur.validate(demande(90.0)).isEmpty());
        assertFalse(validateur.validate(demande(-1.0)).isEmpty(), "une tenue négative n'a pas de sens");
    }
}
