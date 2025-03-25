# Finance Dashboard

Spring Boot application for managing personal finances.

## Development

### Prerequisites
- Java 21
- PostgreSQL
- Maven

### Running locally
1. Create PostgreSQL database named `finance`
2. Update `application.yml` with your database credentials if needed
3. Run: `./mvnw spring-boot:run`

### Running with Docker
```bash
./mvnw clean package
docker build -t finance-dashboard .
docker run -p 8080:8080 finance-dashboard
```

## Deployment
This application is configured for deployment on Render.com

### Environment Variables
- `SPRING_PROFILES_ACTIVE`: prod
- `SPRING_DATASOURCE_URL`: Database URL
- `ADMIN_USERNAME`: Admin username
- `ADMIN_PASSWORD`: Admin password
- `FRONTEND_URL`: Frontend application URL for CORS
