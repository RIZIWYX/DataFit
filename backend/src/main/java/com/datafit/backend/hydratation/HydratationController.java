package com.datafit.backend.hydratation;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// L'eau bue, notée sur la page Nutrition. Une ligne par ajout, pour pouvoir annuler le dernier.
//   GET    /api/hydratation/{utilisateurId}/{date}  -> les ajouts du jour [{ id, ml }]
//   POST   /api/hydratation/{utilisateurId}         -> { date, ml } ; renvoie { id, date, ml }
//   DELETE /api/hydratation/{utilisateurId}/{id}    -> retire un ajout
@RestController
@RequestMapping("/api/hydratation")
public class HydratationController {

    // un ajout ne peut pas dépasser 5 L (même limite que la contrainte de la table)
    private static final int ML_MAX = 5000;

    private final JdbcTemplate jdbc;

    public HydratationController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record AjoutRequest(String date, Integer ml) {}

    public record Ajout(int id, String date, int ml) {}

    @GetMapping("/{utilisateurId}/{date}")
    public ResponseEntity<?> duJour(@PathVariable int utilisateurId, @PathVariable String date) {
        LocalDate jour = lireDate(date);
        if (jour == null) return erreur(HttpStatus.BAD_REQUEST, "Date invalide (format attendu : AAAA-MM-JJ).");

        List<Ajout> ajouts = jdbc.query(
                "SELECT id, date, ml FROM hydratation WHERE utilisateur_id = ? AND date = ? ORDER BY id",
                (ligne, i) -> new Ajout(ligne.getInt("id"), ligne.getDate("date").toLocalDate().toString(),
                        ligne.getInt("ml")),
                utilisateurId, jour);
        return ResponseEntity.ok(ajouts);
    }

    @PostMapping("/{utilisateurId}")
    public ResponseEntity<?> ajouter(@PathVariable int utilisateurId, @RequestBody AjoutRequest requete) {
        LocalDate jour = requete == null ? null : lireDate(requete.date());
        if (jour == null) return erreur(HttpStatus.BAD_REQUEST, "Date invalide (format attendu : AAAA-MM-JJ).");
        if (requete.ml() == null || requete.ml() <= 0 || requete.ml() > ML_MAX) {
            return erreur(HttpStatus.BAD_REQUEST, "Quantité d'eau invalide (entre 1 et " + ML_MAX + " ml).");
        }

        Integer existe = jdbc.queryForObject("SELECT count(*) FROM utilisateur WHERE id = ?", Integer.class,
                utilisateurId);
        if (existe == null || existe == 0) return erreur(HttpStatus.NOT_FOUND, "Utilisateur introuvable.");

        Integer id = jdbc.queryForObject(
                "INSERT INTO hydratation (utilisateur_id, date, ml) VALUES (?, ?, ?) RETURNING id",
                Integer.class, utilisateurId, jour, requete.ml());
        return ResponseEntity.status(HttpStatus.CREATED).body(new Ajout(id, jour.toString(), requete.ml()));
    }

    @DeleteMapping("/{utilisateurId}/{id}")
    public ResponseEntity<?> supprimer(@PathVariable int utilisateurId, @PathVariable int id) {
        // l'utilisateur dans la condition : on ne retire jamais l'eau d'un autre compte
        int lignes = jdbc.update("DELETE FROM hydratation WHERE id = ? AND utilisateur_id = ?", id, utilisateurId);
        if (lignes == 0) return erreur(HttpStatus.NOT_FOUND, "Ajout d'eau introuvable.");
        return ResponseEntity.noContent().build();
    }

    private static LocalDate lireDate(String date) {
        try {
            return date == null ? null : LocalDate.parse(date);
        } catch (Exception e) {
            return null;
        }
    }

    private static ResponseEntity<Map<String, String>> erreur(HttpStatus statut, String message) {
        return ResponseEntity.status(statut).body(Map.of("error", message));
    }
}
