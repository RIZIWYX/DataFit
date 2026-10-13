# ---------- Étape 1 : compiler le .jar ----------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# On copie d'abord ce qui décrit les dépendances, pour profiter du cache
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -q

# Puis le code source, et on compile (sans les tests : ils ont besoin d'une base)
COPY src src
RUN ./mvnw package -DskipTests -q

# ---------- Étape 2 : l'image finale, juste de quoi exécuter ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
