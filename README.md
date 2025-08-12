# Library-Management-System-NodeJS-Project
A RESTful API for managing books, borrowers, and borrowing processes in a library. Built with Node.js, TypeScript, Express, and PostgreSQL. Supports CRUD operations, search, overdue tracking, CSV/XLSX exports, authentication, rate limiting, Docker setup, Swagger docs, and unit tests for core features.


# Application Specs

* Node.js
* Express.js
* Basic Auth
* Rate Limiting & Validation Middleware
* PostgreSQL
* Docker
* Swagger UI (OpenAPI)
* Unit Testing with Jest & Supertest
* Modular Architecture – Organized into controllers, routes, middlewares, services, utils for maintainability

# 🚀 How to Boot Up the Service

## Prerequisites
- **Docker** installed on your machine
- **Node.js v20+** installed (if you want to run without Docker)
- **PostgreSQL** (if running locally without Docker)

---

## Requirements Covered
- Books Management
- Borrowers Management
- Borrowing Process
- Security: Basic Authentication & Input Validation
- Performance Optimization
- Error Handling
- Rate Limiting
- Unit Testing
- API Documentation
- Dockerized Setup

---

## Steps

### 1️⃣ Clone the Project
```bash
git clone https://github.com/YoussefAdel30/Library-Management-System-NodeJS-Project
cd <your-project-folder>
```


### 2️⃣ Start the Application
```bash
docker compose build --no-cache
docker compose up
```
#### OR
```bash
docker compose up --build
```
but if you found problems like npm install command is cached go with the first one.

### 3️⃣ Run Unit Tests
```bash
docker compose run --rm app npm test -- --runInBand --colors
```
#### Note
Tests run automatically when the system starts, but their logs are not displayed. To view the test results, run the command above manually.

### 4️⃣ Stop the Application
```bash
docker compose down
```

## After Bootup Steps
### Setup
On application start, the database is created using migration scripts.

The system has a single user for authentication, which can access all endpoints using **Basic Authentication** (either via Postman or Swagger):

- **Username:** admin  
- **Password:** securepassword123













# Important Notes
* Sensitive data and secrets are included directly in the application properties for simplicity. In a production environment, these should be kept in a secured place such as a vault or AWS Parameter Store and set from those secured stores.
