package com.datafit.backend.compte;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

// Le consentement au traitement des données de santé (RGPD, article 9).
// Donné à l'inscription par e-mail (case dédiée). Les comptes plus anciens et ceux créés avec
// Google ne l'ont pas encore donné : l'application le leur demande avant de s'ouvrir (voir
// frontend/src/pages/ConsentementSante.tsx), et le date ici.
@Service
public class ConsentementSanteService {

    private final UtilisateurRepository utilisateurRepository;

    public ConsentementSanteService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    // La date du consentement, ou vide s'il n'a pas été donné.
    @Transactional(readOnly = true)
    public Optional<LocalDateTime> lire(Long utilisateurId) {
        return Optional.ofNullable(trouver(utilisateurId).getSanteAccepteeLe());
    }

    // Enregistre le consentement. Déjà donné : la date d'origine est gardée.
    @Transactional
    public LocalDateTime accepter(Long utilisateurId) {
        Utilisateur utilisateur = trouver(utilisateurId);
        utilisateur.accepterSante();
        return utilisateurRepository.save(utilisateur).getSanteAccepteeLe();
    }

    private Utilisateur trouver(Long utilisateurId) {
        return utilisateurRepository.findById(utilisateurId)
            .orElseThrow(() -> new NoSuchElementException("Ce compte n'existe pas"));
    }
}
