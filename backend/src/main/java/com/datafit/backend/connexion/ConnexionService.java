package com.datafit.backend.connexion;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConnexionService {

    // Le même message dans les deux cas : sinon, on révélerait à n'importe qui
    // quelles adresses e-mail ont un compte sur DataFit.
    private static final String IDENTIFIANTS_INCORRECTS =
        "Adresse e-mail ou mot de passe incorrect";

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public ConnexionService(
            UtilisateurRepository utilisateurRepository,
            PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Utilisateur seConnecter(ConnexionRequest request) {
        String email = request.email().trim();

        Utilisateur utilisateur = utilisateurRepository
            .findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException(
                IDENTIFIANTS_INCORRECTS
            ));

        // BCrypt ajoute un sel aléatoire : chiffrer deux fois le même mot de passe
        // donne deux résultats différents. On ne compare donc jamais deux hachés :
        // matches() rechiffre le mot de passe tapé avec le sel du haché enregistré.
        if (!passwordEncoder.matches(request.password(), utilisateur.getPasswordHash())) {
            throw new IllegalArgumentException(IDENTIFIANTS_INCORRECTS);
        }

        // vérifié après le mot de passe : sans lui, on ne dit rien de l'état du compte
        if (!utilisateur.emailVerifie()) {
            throw new EmailNonVerifieException();
        }

        return utilisateur;
    }
}
