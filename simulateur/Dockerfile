FROM python:3.15-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY *.py ./

# Pas de root dans le conteneur : une faille dans le service ne donnerait pas les pleins pouvoirs
RUN useradd --system --uid 10001 --no-create-home datafit
USER 10001

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
