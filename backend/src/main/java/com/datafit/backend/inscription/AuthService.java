package com.datafit.backend.inscription;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Service
public class AuthService {

    static final int MOT_DE_PASSE_OCTETS_MAX = 72;

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
        // en minuscules : Toto@x.fr et toto@x.fr ne doivent pas donner deux comptes
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        // BCrypt ne lit que les 72 premiers OCTETS du mot de passe (un « é » en prend 2) : au-delà,
        // la fin serait ignorée sans prévenir. Le @Size de RegisterRequest compte des caractères.
        if (request.password().getBytes(StandardCharsets.UTF_8).length > MOT_DE_PASSE_OCTETS_MAX) {
            throw new IllegalArgumentException(
                "Le mot de passe est trop long (72 octets au plus : les lettres accentuées en comptent 2)"
            );
        }

        if (utilisateurRepository.existsByEmailIgnoreCase(email)) {
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
        // idem pour le consentement aux données de santé (case distincte des CGU)
        utilisateur.accepterSante();

        return utilisateurRepository.save(utilisateur);
    }
}
