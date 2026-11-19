FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV MPLBACKEND=Agg
# matplotlib écrit un cache : dans /tmp, seul dossier modifiable pour un utilisateur sans droits
ENV MPLCONFIGDIR=/tmp/matplotlib

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Pas de root dans le conteneur : une faille dans le service ne donnerait pas les pleins pouvoirs
RUN useradd --system --uid 10001 --no-create-home datafit
USER 10001

EXPOSE 8001

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
