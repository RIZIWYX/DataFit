package com.datafit.backend.compte;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

// Garde-fou de « Effacer mes données » : lit les fichiers de db/ et vérifie que CHAQUE table qui a
// une colonne utilisateur_id est soit effacée par une catégorie (CategorieDonnees), soit gardée
// exprès (CompteService.TABLES_GARDEES). Une nouvelle table oubliée fait échouer ce test, au lieu
// de laisser des données d'un utilisateur qui croit les avoir effacées.
class EffacementTablesTest {

    // les tests sont lancés depuis backend/ : les fichiers SQL sont dans ../db
    private static final Path DOSSIER_DB = Path.of("..", "db");

    private static final Pattern TABLE =
        Pattern.compile("CREATE TABLE IF NOT EXISTS\\s+(\\w+)\\s*\\((.*?)\\n\\)\\s*;", Pattern.DOTALL);

    // les tables de db/ qui ont une colonne utilisateur_id
    private static Set<String> tablesLieesAuCompte() throws IOException {
        Set<String> tables = new TreeSet<>();
        try (Stream<Path> fichiers = Files.list(DOSSIER_DB)) {
            for (Path fichier : fichiers.filter(f -> f.toString().endsWith(".sql")).toList()) {
                Matcher m = TABLE.matcher(Files.readString(fichier));
                while (m.find()) {
                    if (m.group(2).contains("utilisateur_id")) tables.add(m.group(1));
                }
            }
        }
        return tables;
    }

    private static Set<String> tablesEffacees() {
        Set<String> tables = new HashSet<>();
        Arrays.stream(CategorieDonnees.values()).forEach(c -> tables.addAll(c.tables()));
        return tables;
    }

    @Test
    void chaqueTableLieeAuCompteEstEffaceeOuGardeeExpres() throws IOException {
        assumeTrue(Files.isDirectory(DOSSIER_DB), "dossier db/ introuvable depuis " + Path.of("").toAbsolutePath());
        Set<String> liees = tablesLieesAuCompte();
        assertFalse(liees.isEmpty(), "aucune table trouvée dans db/ : l'expression du test est à revoir");

        Set<String> oubliees = new TreeSet<>(liees);
        oubliees.removeAll(tablesEffacees());
        oubliees.removeAll(CompteService.TABLES_GARDEES);
        assertTrue(oubliees.isEmpty(),
            "tables avec utilisateur_id rangées nulle part (à ajouter dans CategorieDonnees ou TABLES_GARDEES) : " + oubliees);
    }

    @Test
    void chaqueTableEffaceeExisteVraimentDansDb() throws IOException {
        assumeTrue(Files.isDirectory(DOSSIER_DB), "dossier db/ introuvable depuis " + Path.of("").toAbsolutePath());
        Set<String> inconnues = new TreeSet<>(tablesEffacees());
        inconnues.removeAll(tablesLieesAuCompte());
        assertTrue(inconnues.isEmpty(), "tables de CategorieDonnees absentes de db/ (faute de frappe ?) : " + inconnues);
    }

    @Test
    void aucuneTableNEstAlaFoisEffaceeEtGardee() {
        Set<String> lesDeux = new TreeSet<>(tablesEffacees());
        lesDeux.retainAll(CompteService.TABLES_GARDEES);
        assertTrue(lesDeux.isEmpty(), "tables à la fois effacées et gardées : " + lesDeux);
    }
}
