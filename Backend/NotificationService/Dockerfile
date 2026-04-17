# Stage 1: Build the application using a full JDK
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

# Copy your Maven/Gradle wrapper and project files
COPY . .

# Stage 2: Use a lightweight JRE base image
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built JAR from the previous stage
COPY --from=build /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]