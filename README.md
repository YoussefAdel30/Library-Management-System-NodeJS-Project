# Library-Management-System-NodeJS-Project
A RESTful API for managing books, borrowers, and borrowing processes in a library. Built with Node.js, Express, and PostgreSQL. Supports CRUD operations, search, overdue tracking, CSV/XLSX exports, authentication, rate limiting, Docker setup, Swagger docs, and unit tests for core features.

# 📚 Table of Contents
1. [Application Specs](#application-specs)
2. [Database ERD in PgAdmin](#database-erd-in-pgadmin)
3. [🚀 How to Boot Up the Service](#-how-to-boot-up-the-service)
   - [Prerequisites](#prerequisites)
   - [Requirements Covered](#requirements-covered)
   - [Steps](#steps)
     1. [Clone the Project](#1️⃣-clone-the-project)
     2. [Start the Application](#2️⃣-start-the-application)
     3. [Run Unit Tests](#3️⃣-run-unit-tests)
     4. [Stop the Application](#4️⃣-stop-the-application)
4. [After Bootup Steps](#after-bootup-steps)
   - [Setup](#setup)
   - [Try the APIs](#try-the-apis)
     - [Using Postman Collection](#using-postman-collection)
     - [Swagger to Directly Execute Requests](#swagger-to-directly-execute-requests)
5. [Important Notes](#important-notes)

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

# Database ERD in PgAdmin
<img width="1173" height="806" alt="image" src="https://github.com/user-attachments/assets/889fa0ac-0449-49ee-acf4-4dddc4bd0e9d" />

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

#### ⚠️ Note on Logs:
When you run the application with docker compose up, logs from both the Node.js app and PostgreSQL database containers are streamed together in real time, interleaved by timestamp. Each log line is prefixed with the container name (e.g., app-1 or db-1) to help identify its source. Because of this, startup messages from the app might not appear at the very end of the log output, as shown in the example below.
<img width="500" height="150" alt="image" src="https://github.com/user-attachments/assets/bd074b39-8a84-461d-8ae6-48ade19a14cc" />


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

### Try the APIs
#### Using Postman Collection
1️⃣ Import the collection and environments files which are present in the "postman" directory.
<img width="1918" height="606" alt="image" src="https://github.com/user-attachments/assets/5498d6c0-1d37-4501-a869-f0714a90773a" />

2️⃣ Click on the right icon of the enviroment .json to activate the enviroment variables.
<img width="1918" height="661" alt="image" src="https://github.com/user-attachments/assets/976bfdf8-fb4e-4fdc-a5fa-6d91fd78a854" />

3️⃣ After using the enviroment variable (user and pass), you can now hit any API smoothly.

4️⃣ If you face any problems importing the collection and environments, go with swagger approach. But, you will be asked to enter credentials manually which is provided above.

#### Swagger to Directly Execute Requests
1️⃣ Access Swagger at: http://localhost:5000/api-docs
<img width="1897" height="752" alt="image" src="https://github.com/user-attachments/assets/360c807a-1815-407a-a894-434a7e28d935" />

2️⃣ You can now use Swagger to execute requests directly. But, at your first request you will be asked to enter Credentials which is provided above.










# Important Notes
* **Sensitive Data**  
  Sensitive data and secrets (such as database credentials and API authentication details) are included directly in the application properties for simplicity.  
  ⚠️ In a production environment, these must be stored securely (e.g., HashiCorp Vault, AWS Parameter Store, or environment variables) instead of hardcoding them.

* **Authentication**  
  The application uses Basic Authentication with a single static user (`admin/securepassword123`).  
  In a production-grade system, credentials should be stored securely and authentication should be implemented using a robust mechanism (e.g., JWT or OAuth2).
  
* **Database Initialization**  
  The database is automatically initialized with migration scripts on application startup. This behavior is suitable for development and testing but should be reviewed for production environments to avoid accidental data loss.

* **Testing**  
  Unit tests are implemented using Jest. By default, tests run automatically on application start in the development environment, but logs may not be visible unless executed manually.

* **Rate Limiting**  
  Rate limiting is applied to specific endpoints for demonstration purposes. In production, configuration should be adjusted based on API usage patterns.

* **Swagger UI**  
  API documentation is available via Swagger UI. Remember to disable or secure Swagger in production to avoid exposing internal API details.
