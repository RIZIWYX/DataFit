# Étape 1 : compiler le .jar
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# On copie d'abord ce qui décrit les dépendances, pour profiter du cache
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -q

# Puis le code source, et on compile (sans les tests : ils ont besoin d'une base)
COPY src src
RUN ./mvnw package -DskipTests -q

# Étape 2 : l'image finale, juste de quoi exécuter
FROM eclipse-temurin:21-jre
WORKDIR /app

# Le serveur ne tourne pas en root : une faille dans l'application ne donnerait pas
# les pleins pouvoirs sur le conteneur. Le dossier des mesures de la montre lui appartient.
RUN groupadd --system --gid 10001 datafit \
    && useradd --system --uid 10001 --gid datafit --no-create-home datafit \
    && mkdir -p /app/donnees-montre \
    && chown datafit:datafit /app/donnees-montre
COPY --from=build /app/target/*.jar app.jar
USER 10001:10001

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
