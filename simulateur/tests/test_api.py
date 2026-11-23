"""Tests de l'API du simulateur : routes, validation des entrées, pages de documentation éteintes."""
import importlib
import os
import sys
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

import main

DEMANDE = {
    "profil": {
        "utilisateur_id": 7,
        "sexe": "F",
        "poids": 62,
        "taille": 170,
        "niveau": "intermediaire",
        "date_naissance": "1994-05-12",
    },
    "seance": {"type": "cardio", "nom": "Séance de course", "date": "2026-11-10"},
}


def demande(**changements):
    """Une demande valide, avec des champs du profil ou de la séance modifiés."""
    copie = {"profil": dict(DEMANDE["profil"]), "seance": dict(DEMANDE["seance"])}
    for cle, valeur in changements.items():
        partie, champ = cle.split("__")
        copie[partie][champ] = valeur
    return copie


class ApiSimulateurTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(main.app)

    def test_route_sante_pour_les_healthchecks(self):
        reponse = self.client.get("/sante")
        self.assertEqual(reponse.status_code, 200)
        self.assertEqual(reponse.json(), {"statut": "ok"})

    def test_pages_de_documentation_eteintes_par_defaut(self):
        for chemin in ("/docs", "/redoc", "/openapi.json"):
            with self.subTest(chemin=chemin):
                self.assertEqual(self.client.get(chemin).status_code, 404)

    def test_documentation_rallumee_avec_docs_actives(self):
        with mock.patch.dict(os.environ, {"DOCS_ACTIVES": "1"}):
            importlib.reload(main)
            self.assertEqual(TestClient(main.app).get("/openapi.json").status_code, 200)
        importlib.reload(main)
        self.assertEqual(TestClient(main.app).get("/openapi.json").status_code, 404)

    def test_simule_chaque_type_de_seance(self):
        for sport in ("cardio", "natation", "muscu", "velo", "sommeil"):
            with self.subTest(sport=sport):
                reponse = self.client.post("/simuler", json=demande(seance__type=sport))
                self.assertEqual(reponse.status_code, 200, reponse.text)
                self.assertTrue(reponse.json())

    def test_refuse_un_type_de_seance_inconnu(self):
        self.assertEqual(self.client.post("/simuler", json=demande(seance__type="golf")).status_code, 422)

    def test_refuse_un_niveau_inconnu(self):
        # « pro » est devenu « confirmer » : l'ancienne valeur doit être refusée
        self.assertEqual(self.client.post("/simuler", json=demande(profil__niveau="pro")).status_code, 422)
        self.assertEqual(self.client.post("/simuler", json=demande(profil__niveau="confirmer")).status_code, 200)

    def test_refuse_un_poids_ou_une_taille_nuls(self):
        self.assertEqual(self.client.post("/simuler", json=demande(profil__poids=0)).status_code, 422)
        self.assertEqual(self.client.post("/simuler", json=demande(profil__taille=-3)).status_code, 422)

    def test_refuse_un_nom_de_seance_vide(self):
        self.assertEqual(self.client.post("/simuler", json=demande(seance__nom="")).status_code, 422)

    def test_refuse_une_naissance_apres_la_seance(self):
        reponse = self.client.post("/simuler", json=demande(profil__date_naissance="2027-01-01"))
        self.assertEqual(reponse.status_code, 422)

    def test_refuse_un_corps_incomplet(self):
        self.assertEqual(self.client.post("/simuler", json={}).status_code, 422)
        self.assertEqual(self.client.post("/simuler", json={"profil": DEMANDE["profil"]}).status_code, 422)


class AgeTests(unittest.TestCase):
    def test_age_avant_et_apres_l_anniversaire(self):
        from datetime import date

        self.assertEqual(main.calculer_age(date(2000, 6, 15), date(2026, 6, 14)), 25)
        self.assertEqual(main.calculer_age(date(2000, 6, 15), date(2026, 6, 15)), 26)

    def test_naissance_non_anterieure_refusee(self):
        from datetime import date

        with self.assertRaises(ValueError):
            main.calculer_age(date(2026, 6, 15), date(2026, 6, 15))


if __name__ == "__main__":
    unittest.main()
