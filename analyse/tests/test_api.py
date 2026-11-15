"""Tests de l'API d'analyse : routes, validation des entrées, pages de documentation éteintes."""
import importlib
import os
import sys
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from app import main


class ApiAnalyseTests(unittest.TestCase):
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

    def test_refuse_un_sport_inconnu_ou_absent(self):
        for corps in ({"sport": "golf"}, {}, {"sport": 3}, {"sport": None}):
            with self.subTest(corps=corps):
                reponse = self.client.post("/analyser", json=corps)
                self.assertEqual(reponse.status_code, 422)

    def test_refuse_un_corps_qui_n_est_pas_un_objet(self):
        self.assertEqual(self.client.post("/analyser", json=[1, 2]).status_code, 422)

    def test_liste_les_sports_analysables_dans_le_message(self):
        detail = self.client.post("/analyser", json={"sport": "golf"}).json()["detail"]
        for sport in ("cardio", "velo", "natation", "muscu", "nutrition", "sommeil"):
            self.assertIn(sport, detail)


if __name__ == "__main__":
    unittest.main()
