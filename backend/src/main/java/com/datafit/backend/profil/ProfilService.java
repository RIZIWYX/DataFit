package com.datafit.backend.profil;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.NoSuchElementException;

@Service
public class ProfilService {

    // âges acceptés, comme sur la page de création du profil
    private static final int AGE_MIN = 10;
    private static final int AGE_MAX = 100;

    private final ProfilRepository profilRepository;
    private final UtilisateurRepository utilisateurRepository;

    public ProfilService(
            ProfilRepository profilRepository,
            UtilisateurRepository utilisateurRepository) {
        this.profilRepository = profilRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Transactional
    public Profil creerProfil(ProfilRequest request) {
        Utilisateur utilisateur = utilisateurRepository
            .findById(request.utilisateurId())
            .orElseThrow(() -> new IllegalArgumentException(
                "Ce compte n'existe pas"
            ));

        if (profilRepository.existsById(utilisateur.getId())) {
            throw new IllegalArgumentException(
                "Le profil de ce compte est déjà créé"
            );
        }

        verifierAge(request.dateNaissance());

        Profil profil = new Profil(
            utilisateur,
            request.nom().trim(),
            request.prenom().trim(),
            request.sexe(),
            request.poids(),
            request.taille(),
            request.objectif().trim(),
            request.niveau().trim(),
            request.activite().trim(),
            request.dateNaissance()
        );

        return profilRepository.save(profil);
    }

    @Transactional(readOnly = true)
    public Profil lireProfil(Long utilisateurId) {
        return profilRepository.findById(utilisateurId)
            .orElseThrow(() -> new NoSuchElementException(
                "Ce compte n'a pas encore de profil"
            ));
    }

    // Remplace toutes les informations du profil ; enregistré à la fin de la transaction
    @Transactional
    public Profil modifierProfil(Long utilisateurId, ProfilModificationRequest request) {
        Profil profil = profilRepository.findById(utilisateurId)
            .orElseThrow(() -> new NoSuchElementException(
                "Ce compte n'a pas encore de profil"
            ));

        verifierAge(request.dateNaissance());

        profil.modifier(
            request.nom().trim(),
            request.prenom().trim(),
            request.sexe(),
            request.poids(),
            request.taille(),
            request.objectif().trim(),
            request.niveau().trim(),
            request.activite().trim(),
            request.dateNaissance()
        );

        return profil;
    }

    private static void verifierAge(LocalDate dateNaissance) {
        int age = Period.between(dateNaissance, LocalDate.now()).getYears();
        if (age < AGE_MIN || age > AGE_MAX) {
            throw new IllegalArgumentException(
                "La date de naissance doit correspondre à un âge entre "
                    + AGE_MIN + " et " + AGE_MAX + " ans"
            );
        }
    }
}
