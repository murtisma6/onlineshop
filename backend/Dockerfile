# Build stage
FROM maven:3.8-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Run stage
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

# Environment variables with defaults that match the host setup
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/onlineshop
ENV SPRING_DATASOURCE_USERNAME=postgres
ENV SPRING_DATASOURCE_PASSWORD=postgres
ENV APP_UPLOAD_DIR=/app/images

ENTRYPOINT ["java", "-jar", "app.jar"]
