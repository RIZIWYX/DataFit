import importlib
import json
import math
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / 'analyse'), str(ROOT / 'simulateur')]
from app.graphiques import graphiques_seance, graphiques_progression, graphiques_sommeil
from app.traitements.analyse_sommeil import analyser_sommeil


class GraphiquesTests(unittest.TestCase):
    def test_mesures_simulees_quatre_sports(self):
        profil = dict(id_utilisateur=7, age=24, poids_kg=65, taille_cm=170, sexe='F', niveau='intermediaire')
        for sport in ['cardio', 'velo', 'natation', 'muscu']:
            with self.subTest(sport=sport):
                module = importlib.import_module(sport)
                brut = getattr(module, 'simuler_' + sport)(profil)
                brut['sport'] = sport
                resultat = graphiques_seance(brut)
                json.dumps(resultat, allow_nan=False)
                graphes = {g['id']: g for g in resultat['graphiques']}
                fc = graphes['fc']['series'][0]['points']
                self.assertEqual(len(fc), len(brut['mesures']))
                self.assertAlmostEqual(fc[-1]['x'], sum(m['duree_s'] for m in brut['mesures']) / 60)
                self.assertEqual([p['y'] for p in fc], [m['heart_rate'] for m in brut['mesures']])
                self.assertEqual(sum(p['y'] for p in graphes['distribution-fc']['series'][0]['points']), len(fc))
                if sport != 'muscu':
                    self.assertIn('vitesse', graphes)
                    self.assertIn('distance', graphes)
                    distance = brut['mesures'][-1].get('distance_km', brut['mesures'][-1].get('distance_m', 0) / 1000)
                    self.assertAlmostEqual(graphes['distance']['series'][0]['points'][-1]['y'], distance)
                else:
                    self.assertNotIn('vitesse', graphes)
                    self.assertNotIn('distance', graphes)
                    self.assertIn('repetitions', graphes)

    def test_intervalles_irreguliers_et_histogrammes_constants(self):
        brut = {'sport': 'cardio', 'mesures': [
            {'duree_s': 10, 'heart_rate': 120, 'speed_kmh': 10, 'distance_km': .03},
            {'duree_s': 50, 'heart_rate': 120, 'speed_kmh': 10, 'distance_km': .17},
        ]}
        g = graphiques_seance(brut)['graphiques']
        self.assertEqual([p['x'] for p in g[0]['series'][0]['points']], [1 / 6, 1])
        self.assertEqual(sum(p['y'] for p in g[-1]['series'][0]['points']), 2)

    def test_progression_tri_moyenne_mobile_et_metriques_absentes(self):
        seances = [dict(sport='cardio', id=i, date=f'2026-11-0{i}', nom='Course', vitesseMoyKmh=v,
                        fcMoy=140, dureeS=1800, distanceM=d) for i, v, d in [(3, 15, 6000), (1, 9, 5000), (2, 12, 5000)]]
        g = {g['id']: g for g in graphiques_progression({'seances': seances})['graphiques']}
        self.assertEqual([p['y'] for p in g['cardio-vitesseMoyKmh']['series'][1]['points']], [9, 10.5, 12])
        self.assertNotIn('cardio-variationVitesse', g)
        self.assertEqual(len(g['cardio-5km']['series'][0]['points']), 2)
        self.assertEqual(g['cardio-distanceM']['series'][0]['points'][-1]['y'], 6)

    def test_aucune_donnee_inventee(self):
        self.assertEqual(graphiques_progression({'seances': []})['graphiques'], [])
        for data in [{'sport': 'cardio', 'mesures': []}, {'sport': 'sommeil', 'mesures': [{}]},
                     {'sport': 'muscu', 'mesures': [{'duree_s': 0, 'heart_rate': 120}]}]:
            with self.assertRaises(ValueError): graphiques_seance(data)
        json.dumps(graphiques_progression({'seances': [{'sport': 'velo', 'id': 1, 'date': '2026-11-01', 'vitesseMoyKmh': math.nan}]}), allow_nan=False)

    def test_nuit_simulee_memes_phases_que_la_base(self):
        sommeil = importlib.import_module('sommeil')
        profil = dict(id_utilisateur=7, age=24, poids_kg=65, taille_cm=170, sexe='F', niveau='intermediaire')
        brut = sommeil.simuler_sommeil(profil)
        brut['sport'] = 'sommeil'
        resultat = graphiques_sommeil(brut)
        json.dumps(resultat, allow_nan=False)
        graphes = {g['id']: g for g in resultat['graphiques']}
        self.assertEqual(set(graphes), {'fc-nuit', 'mouvement', 'phases', 'repartition-phases'})
        self.assertEqual([p['y'] for p in graphes['fc-nuit']['series'][0]['points']], [m['fc_bpm'] for m in brut['mesures']])
        # la répartition des phases est celle enregistrée dans la table sommeil
        resume = analyser_sommeil(brut)
        durees = [p['y'] * 60 for p in graphes['repartition-phases']['series'][0]['points']]
        self.assertEqual(durees, [resume['duree_profond_s'], resume['duree_leger_s'], resume['duree_paradoxal_s'], resume['duree_eveil_s']])

    def test_progression_des_nuits(self):
        nuits = [{'id': i, 'date': f'2026-11-0{i}', 'nom': 'Nuit', 'sport': 'sommeil', 'dureeSommeilS': 27000 + i * 600,
                  'efficaciteSommeilPct': 90.0, 'fcMoyenne': 60.0 + i} for i in range(1, 4)]
        graphes = {g['id']: g for g in graphiques_progression({'seances': nuits})['graphiques']}
        duree = graphes['sommeil-dureeSommeilS']['series'][0]['points']
        self.assertEqual([p['y'] for p in duree], [(27000 + i * 600) / 3600 for i in range(1, 4)])
        self.assertNotIn('sommeil-reveilsNb', graphes)

if __name__ == '__main__':
    unittest.main()
