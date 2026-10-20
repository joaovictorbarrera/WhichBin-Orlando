# Stage 1: Build the Spring Boot application
FROM maven:3.9-eclipse-temurin-21 AS build

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


# Stage 2: Run the application
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/app.jar ./app.jar

# Run as a non-root user.
RUN useradd --system --uid 10001 appuser \
    && chown appuser:appuser /app/app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS:-} -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
