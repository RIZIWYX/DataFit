package com.datafit.backend.nutrition;

import com.datafit.backend.utilisateur.Utilisateur;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NutritionService {
    private final NutritionRepository repo;

    public NutritionService(NutritionRepository repo) {
        this.repo = repo;
    }

    // Bouton "Valider" : crée la ligne du jour.
    // Refuse s'il y a déjà une ligne aujourd'hui pour cet utilisateur.
    public Nutrition valider(Utilisateur user, NutritionRequest req) {
        if (repo.findByUtilisateurAndDate(user, LocalDate.now()).isPresent()) {
            throw new IllegalStateException(
                    "Vos données nutritionnelles ont déjà été enregistrées aujourd'hui.");
        }
        // la date est posée par @PrePersist dans Nutrition
        Nutrition entity = new Nutrition(user, req.calories(), req.proteines(), req.glucides(),
                req.lipides(), req.objectif().trim());
        return repo.save(entity);
    }

    // Bouton "Modifier" : corrige la ligne du jour sans changer la date.
    public Nutrition modifierCelleDuJour(Utilisateur user, NutritionRequest req) {
        Nutrition entity = repo.findByUtilisateurAndDate(user, LocalDate.now())
                .orElseThrow(() -> new IllegalStateException(
                        "Aucune entrée aujourd'hui à modifier."));
        appliquer(entity, req);
        return repo.save(entity);
    }

    // Pour pré-remplir le formulaire au chargement de la page
    @Transactional(readOnly = true)
    public Optional<Nutrition> derniereSaisie(Utilisateur user) {
        return repo.findFirstByUtilisateurOrderByDateDesc(user);
    }

    // Pour savoir si on affiche "Valider" ou "Modifier"
    @Transactional(readOnly = true)
    public Optional<Nutrition> celleDuJour(Utilisateur user) {
        return repo.findByUtilisateurAndDate(user, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<Nutrition> historique(Utilisateur user) {
        return repo.findByUtilisateurOrderByDateDesc(user);
    }

    private void appliquer(Nutrition entity, NutritionRequest req) {
        entity.setCalories(req.calories());
        entity.setProteines(req.proteines());
        entity.setGlucides(req.glucides());
        entity.setLipides(req.lipides());
        entity.setObjectif(req.objectif().trim());
    }
}
