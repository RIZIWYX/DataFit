package com.datafit.backend.profil;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfilService {

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
}
