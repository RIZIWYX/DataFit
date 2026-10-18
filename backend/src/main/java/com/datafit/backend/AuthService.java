package com.datafit.backend;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UtilisateurRepository utilisateurRepository,
            PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
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

        return utilisateurRepository.save(utilisateur);
    }
}

