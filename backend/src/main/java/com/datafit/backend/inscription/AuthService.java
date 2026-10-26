package com.datafit.backend.inscription;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import com.datafit.backend.verification.VerificationService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final VerificationService verificationService;

    public AuthService(
            UtilisateurRepository utilisateurRepository,
            PasswordEncoder passwordEncoder,
            VerificationService verificationService) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.verificationService = verificationService;
    }

    @Transactional
    public Utilisateur inscrire(RegisterRequest request) {
        String email = request.email().trim();

        if (utilisateurRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                "Cette adresse e-mail est déjà utilisée"
            );
        }

        String passwordHash =
            passwordEncoder.encode(request.password());

        Utilisateur utilisateur =
            new Utilisateur(email, passwordHash);
        // RegisterRequest refuse déjà une inscription sans la case cochée : on note la date
        utilisateur.accepterCgu();

        Utilisateur enregistre = utilisateurRepository.save(utilisateur);
        // le compte reste inactif tant que l'adresse n'est pas confirmée par le lien du mail
        verificationService.envoyerLien(enregistre);
        return enregistre;
    }
}
