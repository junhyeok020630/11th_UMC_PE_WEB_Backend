FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /workspace

COPY gradlew build.gradle settings.gradle ./
COPY gradle ./gradle
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

COPY src ./src
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=builder --chown=spring:spring /workspace/build/libs/app.jar ./app.jar

USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=65.0", "-jar", "/app/app.jar"]
