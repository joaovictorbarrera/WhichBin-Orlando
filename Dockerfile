# Stage 1: Build the Spring Boot application
FROM maven:3.9-eclipse-temurin-21-alpine AS build

# Apply security updates to the build image.
RUN apk upgrade --no-cache

WORKDIR /app

# Copy the Maven project files and source code.
COPY pom.xml .
COPY whichbin-api/ ./whichbin-api/

# Build the API module and its required Maven projects.
RUN mvn -B -DskipTests clean package

# Find the executable Spring Boot JAR and give it a stable name.
RUN set -eu; \
    JAR="$(find /app/whichbin-api/target -maxdepth 1 -type f \
      -name '*.jar' ! -name '*.jar.original' | head -n 1)"; \
    test -n "$JAR"; \
    cp "$JAR" /app/app.jar


# Stage 2: Run the application in a minimal, non-root runtime image.
FROM gcr.io/distroless/java21-debian13:nonroot

WORKDIR /app

COPY --from=build /app/app.jar ./app.jar

ENV PORT=443

EXPOSE 443

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
