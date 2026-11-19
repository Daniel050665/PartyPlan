# ===== Imagen del backend para Render =====
# Etapa 1: compila el proyecto con Maven y Java 17
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

# Etapa 2: imagen liviana que solo ejecuta el .jar
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Render indica el puerto en la variable PORT (server.port=${PORT:8080})
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "app.jar"]
