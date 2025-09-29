
<div align="center">
  <img src="https://res.cloudinary.com/df2q6gyuq/image/upload/v1759163480/haid-logo_uwsyvc.jpg" alt="Haid Logo" width="120" />
  
  <h1>🌍 <b>Haid Humanitarian Aid Backend</b></h1>
  
  <p>
    <a href="https://github.com/Lideeyah/Haid/actions"><img src="https://img.shields.io/github/workflow/status/Lideeyah/Haid/CI?style=flat-square" alt="Build Status" /></a>
    <img src="https://img.shields.io/badge/Node.js-18.x-green?style=flat-square" alt="Node.js" />
    <img src="https://img.shields.io/badge/PostgreSQL-15.x-blue?style=flat-square" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Prisma-ORM-purple?style=flat-square" alt="Prisma" />
    <img src="https://img.shields.io/badge/Swagger-API-yellow?style=flat-square" alt="Swagger" />
  </p>
  <p><i>Secure, scalable backend for humanitarian aid distribution</i></p>
</div>

## Overview
Haid is a secure, scalable backend for humanitarian aid distribution, built with Node.js, Express, and Prisma/PostgreSQL. It supports multiple user roles, robust event and scan tracking, and advanced dashboards for donors, NGOs, volunteers, and auditors. The API is fully documented with Swagger and designed for easy frontend integration.

---

## 🧑‍💻 Author

**Nduoma Chinomso Christian**  
_AKA Buzz brain_

---

## 📚 Table of Contents
| Section | Description |
|---|---|
| [Features](#features) | Key backend features |
| [Tech Stack](#tech-stack) | Technologies used |
| [Architecture](#architecture) | Project structure |
| [User Roles](#user-roles) | Supported roles |
| [API Endpoints](#api-endpoints) | Endpoint details |
| [Health Check](#health-check) | Backend status page |
| [Authentication](#authentication) | Auth logic |
| [Event & Aid Logic](#event--aid-logic) | Event/aid flow |
| [Dashboards](#dashboards) | Dashboard endpoints |
| [Error Handling](#error-handling) | Error responses |
| [Blockchain Roadmap](#blockchain-roadmap) | Future plans |
| [Setup & Usage](#setup--usage) | Getting started |
| [Contributing](#contributing) | How to contribute |
| [License](#license) | License info |
---

## 🩺 Health Check

**Endpoint:** `/health`


Displays a beautiful, professional HTML status page showing that the backend is running and healthy. Includes:
- Project logo (from Cloudinary)
- API version, environment, port
- Animated heartbeat and modern UI

**Screenshot:**
![Health Status Page](./route/health.png)

**Note:** If you use an external logo, ensure your backend CSP allows it (see below).

**Swagger Docs:** `/api-docs` (live API documentation)

---

## ✨ Features
- Multi-role authentication: Beneficiary, Donor, Volunteer, NGO, Auditor
- Event creation, volunteer assignment, and aid distribution tracking
- QR code generation for beneficiaries (DID, to be blockchain-integrated)
- Real-time scan logging, duplicate prevention, and audit trails
- Donor and auditor dashboards with KPIs, impact, and verification
- Robust validation and error handling
- Secure JWT authentication (HttpOnly cookies)
- Fully documented Swagger API

---

## 🛠️ Tech Stack
- **Node.js** & **Express.js**: RESTful API
- **Prisma**: ORM for PostgreSQL
- **PostgreSQL**: Relational database
- **JWT**: Authentication
- **bcrypt**: Password hashing
- **Swagger**: API documentation
- **express-validator**: Request validation
- **helmet, morgan, winston**: Security & logging
- **Custom Content Security Policy (CSP)**: Allows images from Cloudinary for branding and UI (see `/health` endpoint and logo usage)

---

## 🏗️ Architecture
- Modular controllers for each domain (auth, events, scans, dashboard, etc.)
- Middleware for authentication, role checks, and error handling
- Prisma schema for users, events, aid logs, and roles
- Separation of validation logic in routes

---

## 👥 User Roles

| Role         | Description                                      | Key Endpoints                |
|--------------|--------------------------------------------------|------------------------------|
| Beneficiary  | Receives aid, has a QR code (simulated DID)      | Registration                 |
| Donor        | Views impact dashboard                           | `/api/donor/dashboard`       |
| Volunteer    | Assigned to events, scans beneficiaries          | `/api/scans`                 |
| NGO          | Creates events, manages volunteers                | `/api/events`, `/api/volunteers` |
| Auditor      | Verifies distribution, views audit dashboard     | `/api/auditor/dashboard`     |

---


## 🚦 API Endpoints

<details>
<summary><b>Endpoint Summary Table</b></summary>

| Method | Endpoint                       | Role(s)         | Description                       |
|--------|-------------------------------|-----------------|------------------------------------|
| POST   | `/api/auth/register`          | All             | Register user                      |
| POST   | `/api/auth/login`             | All             | Login, get JWT cookie              |
| POST   | `/api/auth/logout`            | All             | Logout                             |
| POST   | `/api/events`                 | NGO             | Create event                       |
| GET    | `/api/events`                 | Authenticated   | List events                        |
| GET    | `/api/events/:id`             | Authenticated   | Get event details                  |
| POST   | `/api/events/assign-volunteer`| NGO             | Assign volunteer                   |
| POST   | `/api/scans`                  | Volunteer       | Scan beneficiary QR                |
| GET    | `/api/volunteers`             | Admin, NGO      | List volunteers                    |
| GET    | `/api/volunteers/:id`         | Admin, NGO      | Get volunteer details              |
| GET    | `/api/dashboard/general-stats`| Admin, NGO      | General dashboard stats            |
| GET    | `/api/donor/dashboard`        | Donor           | Donor dashboard KPIs               |
| GET    | `/api/auditor/dashboard`      | Auditor         | Auditor dashboard logs/verification|
</details>

---

#### `POST /api/auth/register`
**Register a new user (beneficiary, donor, volunteer, NGO, auditor)**

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "donor",
  "password": "secret123"
}
```
**Success Response:**
`201 Created`
```json
{
  "message": "User registered",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "donor",
    "createdAt": "2025-09-29T12:00:00Z"
  }
}
```
**Beneficiary Response:**
`201 Created`
```json
{
  "beneficiaryDid": "did:haid:...",
  "qrCodeUrl": "https://..."
}
```
**Error Responses:**
`400 Bad Request`
```json
{
  "errors": [ { "msg": "Valid email is required", "param": "email", "location": "body" } ]
}
```
`400 Bad Request`
```json
{
  "message": "User already exists"
}
```

---

#### `POST /api/auth/login`
**Login as donor, volunteer, NGO, or auditor**

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```
**Success Response:**
`200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "donor"
  }
}
```
**Error Responses:**
`400 Bad Request`
```json
{
  "message": "Invalid credentials"
}
```
`400 Bad Request`
```json
{
  "errors": [ { "msg": "Valid email is required", "param": "email", "location": "body" } ]
}
```

---

#### `POST /api/auth/logout`
**Logout user (clears JWT cookie)**

**Success Response:**
`200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

### Events

#### `POST /api/events`
**Create a new aid event (NGO only)**

**Request Body:**
```json
{
  "name": "Food Drive",
  "type": "food",
  "location": "Lagos",
  "description": "Distributing food",
  "quantity": 100,
  "supplies": ["rice", "beans"],
  "startTime": "2025-10-01T09:00:00Z",
  "endTime": "2025-10-01T17:00:00Z"
}
```
**Success Response:**
`201 Created`
```json
{
  "id": "...",
  "name": "Food Drive",
  "type": "food",
  "location": "Lagos",
  "description": "Distributing food",
  "quantity": 100,
  "supplies": ["rice", "beans"],
  "volunteersCount": 0,
  "volunteers": [],
  "totalServed": 0,
  "duplicates": 0,
  "startTime": "2025-10-01T09:00:00Z",
  "endTime": "2025-10-01T17:00:00Z",
  "createdAt": "2025-09-29T12:00:00Z"
}
```
**Error Responses:**
`400 Bad Request`
```json
{
  "errors": [ { "msg": "Event name is required", "param": "name", "location": "body" } ]
}
```

---

#### `GET /api/events`
**List all events**

**Success Response:**
`200 OK`
```json
[
  {
    "id": "...",
    "name": "Food Drive",
    "type": "food",
    "location": "Lagos",
    ...
  }
]
```

---

#### `GET /api/events/:id`
**Get a single event by ID**

**Success Response:**
`200 OK`
```json
{
  "id": "...",
  "name": "Food Drive",
  ...
}
```
**Error Responses:**
`400 Bad Request`
```json
{
  "errors": [ { "msg": "Valid event id required", "param": "id", "location": "params" } ]
}
```
`404 Not Found`
```json
{
  "message": "Event not found"
}
```

---

#### `POST /api/events/assign-volunteer`
**Assign a volunteer to an event (NGO only)**

**Request Body:**
```json
{
  "eventId": "...",
  "volunteerId": "..."
}
```
**Success Response:**
`200 OK`
```json
{
  "message": "Volunteer assigned to event"
}
```
**Error Responses:**
`400 Bad Request`
```json
{
  "errors": [ { "msg": "Valid eventId required", "param": "eventId", "location": "body" } ]
}
```

---

### Scans

#### `POST /api/scans`
**Scan beneficiary QR code and log aid distribution (volunteer only)**

**Request Body:**
```json
{
  "eventId": "...",
  "beneficiaryDid": "did:haid:..."
}
```
**Success Responses:**
`200 OK` (Aid collected)
```json
{
  "status": "collected",
  "transactionId": "...",
  "timestamp": "2025-09-29T12:34:56Z"
}
```
`200 OK` (Duplicate blocked)
```json
{
  "status": "duplicate-blocked"
}
```
**Error Responses:**
`400 Bad Request`
```json
{
  "errors": [ { "msg": "Valid eventId is required", "param": "eventId", "location": "body" } ]
}
```
`403 Forbidden`
```json
{
  "message": "You are not assigned to this event."
}
```
`404 Not Found`
```json
{
  "message": "Event not found"
}
```
`404 Not Found`
```json
{
  "message": "Beneficiary not found"
}
```

---

### Volunteers

#### `GET /api/volunteers`
**List all volunteers (admin, NGO only)**

**Success Response:**
`200 OK`
```json
[
  {
    "id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "createdAt": "2025-09-29T12:00:00Z",
    "assignedEvents": [ { "id": "...", "name": "Food Drive", "location": "Lagos" } ]
  }
]
```

---

#### `GET /api/volunteers/:id`
**Get volunteer details by ID**

**Success Response:**
`200 OK`
```json
{
  "id": "...",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "createdAt": "2025-09-29T12:00:00Z",
  "assignedEvents": [ { "id": "...", "name": "Food Drive", "location": "Lagos" } ]
}
```
**Error Response:**
`404 Not Found`
```json
{
  "message": "Volunteer not found"
}
```

---

### Dashboard

#### `GET /api/dashboard/general-stats`
**Get general dashboard stats (admin, NGO only)**

**Success Response:**
`200 OK`
```json
{
  "eventsCount": 10,
  "volunteersCount": 25,
  "beneficiariesCount": 120,
  "aidDistributed": 110,
  "aidTypes": ["food", "medicine"]
}
```

---

#### `GET /api/donor/dashboard`
**Get donor dashboard KPIs and impact (donor only)**

**Success Response:**
`200 OK`
```json
{
  "recipientsServed": 120,
  "distributionProgress": {
    "totalEvents": 10,
    "completedEvents": 7,
    "percentCompleted": 70
  },
  "geographicImpact": [
    { "location": "Lagos", "events": 5 },
    { "location": "Abuja", "events": 2 }
  ]
}
```

---

#### `GET /api/auditor/dashboard`
**Get auditor dashboard logs and verification (auditor only)**

**Query Params:**
- `eventId` (optional): Filter logs by event ID
- `date` (optional): Filter logs by date (YYYY-MM-DD)

**Success Response:**
`200 OK`
```json
{
  "logs": [
    {
      "eventId": "...",
      "beneficiaryId": "...",
      "volunteerId": "...",
      "timestamp": "2025-09-29T12:34:56Z",
      "status": "collected",
      "transactionId": "..."
    }
  ],
  "hederaMatch": true
}
```
**Error Responses:**
`400 Bad Request`
```json
{
  "errors": [ { "msg": "Invalid date format. Use YYYY-MM-DD.", "param": "date", "location": "query" } ]
}
```
`404 Not Found`
```json
{
  "message": "Event not found."
}
```

---

## 🔐 Authentication
- JWT tokens are set in HttpOnly cookies after login
- All protected endpoints require authentication
- Role-based access enforced via middleware

---

## 🎫 Event & Aid Logic
- Events are created by NGOs, with volunteers assigned
- Beneficiaries receive a QR code (simulated DID)
- Volunteers scan QR codes to log aid distribution
- Duplicate scans are blocked and logged
- All actions timestamped for auditability

---

## 📊 Dashboards
### Donor Dashboard
- KPIs: Total recipients served, distribution progress, geographic impact
- Endpoint: `GET /api/donor/dashboard`
- Example response:
```json
{
  "recipientsServed": 120,
  "distributionProgress": {
    "totalEvents": 10,
    "completedEvents": 7,
    "percentCompleted": 70
  },
  "geographicImpact": [
    { "location": "Lagos", "events": 5 },
    { "location": "Abuja", "events": 2 }
  ]
}
```

### Auditor Dashboard
- View all aid logs, filter by event/date
- Compare logs with Hedera Guardian (future blockchain integration)
- Endpoint: `GET /api/auditor/dashboard?eventId=...&date=YYYY-MM-DD`
- Example response:
```json
{
  "logs": [
    {
      "eventId": "...",
      "beneficiaryId": "...",
      "volunteerId": "...",
      "timestamp": "2025-09-29T12:34:56Z",
      "status": "collected",
      "transactionId": "..."
    }
  ],
  "hederaMatch": true
}
```

### NGO/Admin Dashboard
- General stats: events, volunteers, beneficiaries, aid distributed, aid types
- Endpoint: `GET /api/dashboard/general-stats`
- Example response:
```json
{
  "eventsCount": 10,
  "volunteersCount": 25,
  "beneficiariesCount": 120,
  "aidDistributed": 110,
  "aidTypes": ["food", "medicine"]
}
```

---

## ❗ Error Handling
- All endpoints return detailed error messages and validation errors
- Example error response:
```json
{
  "errors": [
    { "msg": "Valid email is required", "param": "email", "location": "body" }
  ]
}
```
- Unauthorized, forbidden, not found, and duplicate actions are clearly indicated

---

## ⛓️ Blockchain Roadmap
- **Current:** Beneficiary DID is simulated and QR code generated
- **Future:** DID will be issued and verified via blockchain (Hedera Guardian)
- Auditor dashboard will compare aid logs with blockchain indexer

---

## 🚀 Setup & Usage
1. Clone the repo:
   ```sh
   git clone https://github.com/Lideeyah/Haid.git
   cd Haid
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables in `.env` (see `.env.example`)
4. Run Prisma migrations:
   ```sh
   npx prisma migrate deploy
   ```
5. Start the server:
   ```sh
   npm start
   ```
6. Access Swagger docs at `/api-docs`

---

## 🤝 Contributing
- Please open issues or pull requests for improvements
- Blockchain integration is coming soon—feedback welcome!

---

## 📄 License
MIT

---

- Health check endpoint (`/health`) with stunning HTML status page for live backend status.
- README and health page visuals enhanced for professional presentation.
- API responses include HTTP status codes for frontend clarity.
- Clear, consistent, and predictable endpoints
- Role-based access and validation for security
- All responses are structured for easy frontend consumption
- Swagger docs provide live, interactive API reference
- Future-proof: ready for blockchain integration

---

## 🏁 Quick Reference
- All endpoints, request/response schemas, and error formats are documented in Swagger (`/api-docs`)
- For any questions, reach out via GitHub Issues

