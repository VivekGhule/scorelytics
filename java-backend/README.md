## Java backend (Spring Boot)

### What it is

- Spring Boot API server running on `http://localhost:8080/api`
- MongoDB Atlas storage via `MONGODB_URI`
- JWT auth (Bearer token)

### Setup

1) Create env file:

- Copy `java-backend/.env.example` → `java-backend/.env`
- Fill in:
  - `MONGODB_URI`
  - `JWT_SECRET`

2) Run:

```bash
cd java-backend
mvn spring-boot:run
```


