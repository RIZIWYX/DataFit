
import logging
import os

from fastapi import FastAPI, HTTPException

from app.traitements.analyse_cardio import analyser_cardio
from app.traitements.analyse_velo import analyser_velo
from app.traitements.analyse_natation import analyser_natation
from app.traitements.analyse_muscu import analyser_muscu
from app.traitements.analyse_nutrition import analyser_nutrition
from app.traitements.analyse_sommeil import analyser_sommeil

# La page Swagger (/docs) et le schéma (/openapi.json) décrivent toute l'API à qui les demande :
# éteints par défaut. Pour les avoir en local : DOCS_ACTIVES=1 dans .env.
_DOCS = os.getenv("DOCS_ACTIVES") == "1"
app = FastAPI(
    title="DataFit - Analyses des séances",
    docs_url="/docs" if _DOCS else None,
    redoc_url=None,
    openapi_url="/openapi.json" if _DOCS else None,
)


# utilisé par le healthcheck de docker-compose et par Kubernetes
@app.get("/sante", include_in_schema=False)
def sante():
    return {"statut": "ok"}

logger = logging.getLogger(__name__)

ANALYSEURS = {
    "cardio": analyser_cardio,
    "velo": analyser_velo,
    "natation": analyser_natation,
    "muscu": analyser_muscu,
    "nutrition": analyser_nutrition,
    "sommeil": analyser_sommeil
}


@app.post("/analyser")
def analyser(donnees: dict):
    sport = donnees.get("sport")

    if not isinstance(sport, str) or sport not in ANALYSEURS:
        raise HTTPException(
            status_code=422,
            detail="Analyse attendue : cardio, velo, natation, muscu, nutrition ou sommeil."
        )

    try:
        return ANALYSEURS[sport](donnees)

    except ValueError as erreur:
        raise HTTPException(
            status_code=422,
            detail=str(erreur)
        ) from erreur

    except Exception as erreur:
        logger.exception(
            "Échec de l'analyse de la séance %s",
            sport
        )

        raise HTTPException(
            status_code=500,
            detail="L'analyse de la séance n'a pas pu être réalisée."
        ) from erreur


@app.post("/graphiques")
def graphiques(donnees: dict):
    from app.graphiques import graphiques_seance, graphiques_sommeil
    try:
        # une nuit a ses propres graphes (FC, mouvements, phases) ; le reste est une séance
        if donnees.get("sport") == "sommeil":
            return graphiques_sommeil(donnees)
        return graphiques_seance(donnees)
    except (ValueError, KeyError, TypeError) as erreur:
        raise HTTPException(status_code=422, detail=str(erreur)) from erreur


@app.post("/graphiques/progression")
def progression(donnees: dict):
    from app.graphiques import graphiques_progression
    try:
        return graphiques_progression(donnees)
    except (ValueError, KeyError, TypeError) as erreur:
        raise HTTPException(status_code=422, detail=str(erreur)) from erreur
