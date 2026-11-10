package com.datafit.backend.hydratation;

import com.datafit.backend.utilisateur.Utilisateur;
import com.datafit.backend.utilisateur.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class HydratationService {

    // un ajout ne peut pas dépasser 5 L (même limite que la contrainte de la table)
    public static final int ML_MAX = 5000;

    private final HydratationRepository hydratationRepository;
    private final UtilisateurRepository utilisateurRepository;

    public HydratationService(
            HydratationRepository hydratationRepository,
            UtilisateurRepository utilisateurRepository) {
        this.hydratationRepository = hydratationRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Transactional(readOnly = true)
    public List<Hydratation> duJour(Long utilisateurId, LocalDate date) {
        return hydratationRepository.findByUtilisateurIdAndDateOrderByIdAsc(utilisateurId, date);
    }

    @Transactional
    public Hydratation ajouter(Long utilisateurId, HydratationRequest request) {
        Utilisateur utilisateur = utilisateurRepository
            .findById(utilisateurId)
            .orElseThrow(() -> new NoSuchElementException("Utilisateur introuvable"));

        return hydratationRepository.save(new Hydratation(utilisateur, request.date(), request.ml()));
    }

    @Transactional
    public void supprimer(Long utilisateurId, Long id) {
        Hydratation ajout = hydratationRepository
            .findByIdAndUtilisateurId(id, utilisateurId)
            .orElseThrow(() -> new NoSuchElementException("Ajout d'eau introuvable"));

        hydratationRepository.delete(ajout);
    }
}
