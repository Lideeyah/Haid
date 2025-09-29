# 🌍 Haid Humanitarian Aid Backend

## Overview
Haid is a secure, scalable backend for humanitarian aid distribution, built with Node.js, Express, and Prisma/PostgreSQL. It supports multiple user roles, robust event and scan tracking, and advanced dashboards for donors, NGOs, volunteers, and auditors. The API is fully documented with Swagger and designed for easy frontend integration.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [User Roles](#user-roles)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Event & Aid Logic](#event--aid-logic)
- [Dashboards](#dashboards)
- [Error Handling](#error-handling)
- [Blockchain Roadmap](#blockchain-roadmap)
- [Setup & Usage](#setup--usage)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- Multi-role authentication: Beneficiary, Donor, Volunteer, NGO, Auditor
- Event creation, volunteer assignment, and aid distribution tracking
- QR code generation for beneficiaries (DID, to be blockchain-integrated)
- Real-time scan logging, duplicate prevention, and audit trails
- Donor and auditor dashboards with KPIs, impact, and verification
- Robust validation and error handling
- Secure JWT authentication (HttpOnly cookies)
- Fully documented Swagger API

---

## Tech Stack
- **Node.js** & **Express.js**: RESTful API
- **Prisma**: ORM for PostgreSQL
- **PostgreSQL**: Relational database
- **JWT**: Authentication
- **bcrypt**: Password hashing
- **Swagger**: API documentation
- **express-validator**: Request validation
- **helmet, morgan, winston**: Security & logging

---

## Architecture
- Modular controllers for each domain (auth, events, scans, dashboard, etc.)
- Middleware for authentication, role checks, and error handling
- Prisma schema for users, events, aid logs, and roles
- Separation of validation logic in routes

---

## User Roles
- **Beneficiary**: Receives aid, has a QR code (simulated DID)
- **Donor**: Views impact dashboard
- **Volunteer**: Assigned to events, scans beneficiaries
- **NGO**: Creates events, manages volunteers
- **Auditor**: Verifies distribution, views audit dashboard

---

## API Endpoints

All endpoints are prefixed with `/api/`.

---

### Auth

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
```json
{
  "beneficiaryDid": "did:haid:...",
  "qrCodeUrl": "https://..."
}
```
**Error Responses:**
```json
{
  "errors": [ { "msg": "Valid email is required", "param": "email", "location": "body" } ]
}
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
```json
{
  "message": "Invalid credentials"
}
{
  "errors": [ { "msg": "Valid email is required", "param": "email", "location": "body" } ]
}
```

---

#### `POST /api/auth/logout`
**Logout user (clears JWT cookie)**

**Success Response:**
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
```json
{
  "errors": [ { "msg": "Event name is required", "param": "name", "location": "body" } ]
}
```

---

#### `GET /api/events`
**List all events**

**Success Response:**
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
```json
{
  "id": "...",
  "name": "Food Drive",
  ...
}
```
**Error Responses:**
```json
{
  "errors": [ { "msg": "Valid event id required", "param": "id", "location": "params" } ]
}
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
```json
{
  "message": "Volunteer assigned to event"
}
```
**Error Responses:**
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
Aid collected:
```json
{
  "status": "collected",
  "transactionId": "...",
  "timestamp": "2025-09-29T12:34:56Z"
}
```
Duplicate blocked:
```json
{
  "status": "duplicate-blocked"
}
```
**Error Responses:**
```json
{
  "errors": [ { "msg": "Valid eventId is required", "param": "eventId", "location": "body" } ]
}
{
  "message": "You are not assigned to this event."
}
{
  "message": "Event not found"
}
{
  "message": "Beneficiary not found"
}
```

---

### Volunteers

#### `GET /api/volunteers`
**List all volunteers (admin, NGO only)**

**Success Response:**
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
```json
{
  "errors": [ { "msg": "Invalid date format. Use YYYY-MM-DD.", "param": "date", "location": "query" } ]
}
{
  "message": "Event not found."
}
```

---

## Authentication
- JWT tokens are set in HttpOnly cookies after login
- All protected endpoints require authentication
- Role-based access enforced via middleware

---

## Event & Aid Logic
- Events are created by NGOs, with volunteers assigned
- Beneficiaries receive a QR code (simulated DID)
- Volunteers scan QR codes to log aid distribution
- Duplicate scans are blocked and logged
- All actions timestamped for auditability

---

## Dashboards
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

## Error Handling
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

## Blockchain Roadmap
- **Current:** Beneficiary DID is simulated and QR code generated
- **Future:** DID will be issued and verified via blockchain (Hedera Guardian)
- Auditor dashboard will compare aid logs with blockchain indexer

---

## Setup & Usage
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

## Contributing
- Please open issues or pull requests for improvements
- Blockchain integration is coming soon—feedback welcome!

---

## License
MIT

---

## ✨ UI/UX & API Design Philosophy
- Clear, consistent, and predictable endpoints
- Role-based access and validation for security
- All responses are structured for easy frontend consumption
- Swagger docs provide live, interactive API reference
- Future-proof: ready for blockchain integration

---

## 🚀 Quick Reference
- All endpoints, request/response schemas, and error formats are documented in Swagger (`/api-docs`)
- For any questions, reach out via GitHub Issues

---

> **Note:** This backend is designed for rapid humanitarian deployment. Blockchain features (DID, Guardian verification) will be integrated soon. All simulated DIDs and QR codes will be replaced with real, verifiable credentials.

---

### Made with ❤️ by the Haid Team
