package com.datafit.backend.nutrition;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class NutritionService {
    private final NutritionRepository repo;

    public NutritionService(NutritionRepository repo) {
        this.repo = repo;
    }

    // Bouton "Ajouter" de la page Nutrition : une nouvelle ligne pour ce repas.
    public Nutrition ajouter(Utilisateur user, NutritionRequest req) {
        Nutrition entity = new Nutrition(user, req.date(), req.repas(), req.nom().trim(),
                req.calories(), req.proteines(), req.glucides(), req.lipides(), req.objectif().trim());
        return repo.save(entity);
    }

    // Bouton "Supprimer" d'un repas. Sans effet si le repas n'existe plus (déjà
    // supprimé)
    // ou appartient à un autre utilisateur.
    public void supprimer(Utilisateur user, Long id) {
        repo.deleteByIdAndUtilisateur(id, user);
    }

    @Transactional(readOnly = true)
    public List<Nutrition> duJour(Utilisateur user, LocalDate date) {
        return repo.findByUtilisateurAndDateOrderByIdAsc(user, date);
    }

    @Transactional(readOnly = true)
    public List<Nutrition> historique(Utilisateur user) {
        return repo.findByUtilisateurOrderByDateDescIdDesc(user);
    }
}
