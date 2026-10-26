package com.datafit.backend.sommeil;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class SommeilService {
    private final SommeilRepository repo;

    public SommeilService(SommeilRepository repo) {
        this.repo = repo;
    }

    // Bouton "Ajouter" de la page Sommeil : une nouvelle ligne pour ce sommeil.
    public Sommeil ajouter(Utilisateur user, SommeilRequest req) {
        Sommeil entity = new Sommeil(user, req.date(), req.nom(), req.calories(), req.proteines(), req.glucides(),
                req.lipides(), req.objectif());
        return repo.save(entity);
    }

    // Bouton "Supprimer" d'un repas. Sans effet si le repas n'existe plus (déjà
    // supprimé)
    // ou appartient à un autre utilisateur.
    public void supprimer(Utilisateur user, Long id) {
        repo.deleteByIdAndUtilisateur(id, user);
    }

    @Transactional(readOnly = true)
    public List<Sommeil> duJour(Utilisateur user, LocalDate date) {
        return repo.findByUtilisateurAndDateOrderByIdAsc(user, date);
    }

    @Transactional(readOnly = true)
    public List<Sommeil> historique(Utilisateur user) {
        return repo.findByUtilisateurOrderByDateDescIdDesc(user);
    }
}
