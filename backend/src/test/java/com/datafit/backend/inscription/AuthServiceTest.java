package com.datafit.backend.inscription;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

// L'inscription, testée sans base : le dépôt est simulé, le mot de passe est vraiment haché (BCrypt).
class AuthServiceTest {

    private final PasswordEncoder encodeur = new BCryptPasswordEncoder();
    private final Validator validateur = Validation.buildDefaultValidatorFactory().getValidator();
    private UtilisateurRepository utilisateurs;
    private AuthService service;

    @BeforeEach
    void preparer() {
        utilisateurs = mock(UtilisateurRepository.class);
        when(utilisateurs.save(any(Utilisateur.class))).thenAnswer(a -> a.getArgument(0));
        service = new AuthService(utilisateurs, encodeur);
    }

    private static RegisterRequest demande(String email, String mdp) {
        return new RegisterRequest(email, mdp, true, true);
    }

    @Test
    void inscrireNoteLesDeuxConsentementsEtLeMotDePasseEstHache() {
        Utilisateur u = service.inscrire(demande("alice@test.fr", "motdepasse1"));

        assertNotNull(u.getCguAccepteesLe());
        assertNotNull(u.getSanteAccepteeLe(), "le consentement aux données de santé est daté à l'inscription");
        assertNotEquals("motdepasse1", u.getPasswordHash());
        assertTrue(encodeur.matches("motdepasse1", u.getPasswordHash()));
    }

    @Test
    void lAdresseEstEnregistreeEnMinuscules() {
        ArgumentCaptor<Utilisateur> enregistre = ArgumentCaptor.forClass(Utilisateur.class);

        service.inscrire(demande("  Alice@Test.FR ", "motdepasse1"));

        verify(utilisateurs).save(enregistre.capture());
        assertEquals("alice@test.fr", enregistre.getValue().getEmail());
    }

    @Test
    void uneAdresseDejaUtiliseeSansTenirCompteDesMajusculesEstRefusee() {
        when(utilisateurs.existsByEmailIgnoreCase("alice@test.fr")).thenReturn(true);

        IllegalArgumentException e = assertThrows(IllegalArgumentException.class,
            () -> service.inscrire(demande("ALICE@test.fr", "motdepasse1")));

        assertTrue(e.getMessage().contains("déjà utilisée"));
        verify(utilisateurs, never()).save(any());
    }

    @Test
    void unMotDePasseDePlusDe72OctetsEstRefuse() {
        // 40 « é » = 40 caractères (sous la limite de 72) mais 80 octets : BCrypt ignorerait la fin
        String trop = "é".repeat(40);
        assertThrows(IllegalArgumentException.class, () -> service.inscrire(demande("a@b.fr", trop)));
        verify(utilisateurs, never()).save(any());
    }

    @Test
    void lInscriptionExigeLesDeuxCases() {
        assertTrue(validateur.validate(new RegisterRequest("a@b.fr", "motdepasse1", true, true)).isEmpty());

        assertFalse(validateur.validate(new RegisterRequest("a@b.fr", "motdepasse1", false, true)).isEmpty(),
            "sans la case des CGU");
        assertFalse(validateur.validate(new RegisterRequest("a@b.fr", "motdepasse1", true, false)).isEmpty(),
            "sans le consentement aux données de santé");
    }
}
