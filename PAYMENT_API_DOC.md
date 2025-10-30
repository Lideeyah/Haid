
<div align="center">
  <img src="https://res.cloudinary.com/df2q6gyuq/image/upload/v1759163480/haid-logo_uwsyvc.jpg" alt="Haid Logo" width="100" />
  <h1>🪙 <b>Haid API & Payment Documentation</b></h1>
  <p>
    <img src="https://img.shields.io/badge/Node.js-18.x-green?style=flat-square" alt="Node.js" />
    <img src="https://img.shields.io/badge/Hedera-Hashgraph-5C2D91?style=flat-square&logo=hedera-hashgraph" alt="Hedera" />
    <img src="https://img.shields.io/badge/Swagger-API-yellow?style=flat-square" alt="Swagger" />
  </p>
  <p><b>All endpoints are blockchain-anchored, secure, and ready for Africa-scale humanitarian impact.</b></p>
</div>

---

## 📚 Table of Contents
| Section | Description |
|---|---|
| [Authentication & User](#authentication--user) | Register, login, profile |
| [Donations (HBAR)](#donations-hbar) | HBAR payment endpoints |
| [Donor Dashboard](#donor-dashboard) | Donor stats & impact |
| [Events](#events) | Event management |
| [Volunteers](#volunteers) | Volunteer endpoints |
| [Scans (Aid Distribution)](#scans-aid-distribution) | Aid distribution logic |
| [NGO/Admin Dashboard](#ngoadmin-dashboard) | General stats |
| [Auditor Dashboard](#auditor-dashboard) | Audit logs & verification |
| [Error Handling](#error-handling) | Error responses |

---


## 🔐 Authentication & User

### Register (v2)
- **POST** `/api/v2/register`
- Registers a user and creates a custodial Hedera wallet.
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "donor" | "ngo" | "beneficiary" | "auditor" | "volunteer"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered with Hedera account",
    "token": "JWT",
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "did": "string",
      "didPublicKey": "string",
      "didHederaTx": { ... },
      "hederaAccountId": "string",
      "hederaPublicKey": "string"
    }
  }
  ```


### Login
- **POST** `/api/login`
- Authenticates user and returns JWT + Hedera wallet info + live HBAR balance.
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "JWT",
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "hederaAccountId": "string",
      "hederaPublicKey": "string",
      "hbarBalance": 3.5,
      "qrCodeUrl": "string (beneficiary only)"
    }
  }
  ```

### Logout
- **POST** `/api/logout`
- Logs out user (clears JWT cookie).
- **Response:**
  ```json
  { "message": "Logged out successfully" }
  ```


### Get Current User
- **GET** `/api/me`
- Returns the authenticated user's profile.
- **Headers:** `Authorization: Bearer <JWT>`
- **Response:**
  ```json
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "hederaAccountId": "string",
      "hederaPublicKey": "string",
      "qrCodeUrl": "string (beneficiary only)"
    }
  }
  ```

---


## 💸 Donations (HBAR)

### Make a Donation
- **POST** `/api/donations/hbar`
- Donor sends HBAR to NGO or beneficiary.
- **Headers:** `Authorization: Bearer <JWT>`
- **Request Body:**
  ```json
  {
    "recipientAccountId": "string", // Hedera account ID of recipient
    "amount": 2.5, // Amount in HBAR
    "note": "Donation for October campaign"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Donation successful",
    "transactionId": "string",
    "amount": 2.5,
    "recipientAccountId": "string"
  }
  ```

---


## 📊 Donor Dashboard

### Get Donor Dashboard & Stats
- **GET** `/api/donor/dashboard`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response:**
  ```json
  {
    "totalContribution": 100.5,
    "peopleHelped": 12,
    "locationsReached": ["Lagos", "Abuja"],
    "impactScore": 1206,
    "monthlyImpact": {
      "2025-10": 50,
      "2025-09": 30.5
    },
    "donationFlow": [
      { "amount": 10, "recipient": "<userId>", "timestamp": "2025-10-01T12:00:00Z", "txId": "..." }
    ],
    "recentDistributions": [
      { "amount": 10, "recipient": "<userId>", "timestamp": "2025-10-01T12:00:00Z", "txId": "..." }
    ],
    "distributionProgress": {
      "totalEvents": 20,
      "completedEvents": 15,
      "percentCompleted": 75
    },
    "geographicImpact": [
      { "location": "Lagos", "events": 8 },
      { "location": "Abuja", "events": 5 }
    ]
  }
  ```

---


## 🎉 Events

### Create Event
- **POST** `/api/events`
- **Headers:** `Authorization: Bearer <JWT>`
- **Request Body:**
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
- **Response:**
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
    "createdAt": "2025-09-29T12:00:00Z",
    "hederaTx": {
      "status": "SUCCESS",
      "transactionId": "...",
      "sequenceNumber": 456,
      "runningHash": "..."
    }
  }
  ```

### List Events
- **GET** `/api/events`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response:** Array of event objects (see above).

### Get Event by ID
- **GET** `/api/events/:id`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response:** Event object (see above).

### Assign Volunteer to Event
- **POST** `/api/events/assign-volunteer`
- **Headers:** `Authorization: Bearer <JWT>`
- **Request Body:**
  ```json
  {
    "eventId": "...",
    "volunteerId": "..."
  }
  ```
- **Response:**
  ```json
  { "message": "Volunteer assigned to event" }
  ```

---


## 🦸 Volunteers

### List Volunteers
- **GET** `/api/volunteers`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response:** Array of volunteer objects.

### Get Volunteer by ID
- **GET** `/api/volunteers/:id`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response:** Volunteer object.

---


## 📦 Scans (Aid Distribution)

### Scan Beneficiary QR (Aid Distribution)
- **POST** `/api/scans`
- **Headers:** `Authorization: Bearer <JWT>`
- **Request Body:**
  ```json
  {
    "eventId": "...",
    "beneficiaryDid": "did:haid:..."
  }
  ```
- **Response:**
  - If aid collected:
    ```json
    {
      "status": "collected",
      "hederaTx": { ... },
      "timestamp": "2025-09-29T12:34:56Z"
    }
    ```
  - If duplicate blocked:
    ```json
    { "status": "duplicate-blocked" }
    ```

---


## 🏢 NGO/Admin Dashboard

### General Stats
- **GET** `/api/dashboard/general-stats`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response:**
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


## 🕵️ Auditor Dashboard

### Get Auditor Dashboard Logs & Verification
- **GET** `/api/auditor/dashboard?eventId=...&date=YYYY-MM-DD`
- **Headers:** `Authorization: Bearer <JWT>`
- **Response:**
  ```json
  {
    "logs": [
      {
        "did": "did:haid:...",
        "hederaTx": { ... },
        "status": "collected",
        "timestamp": "2025-09-29T12:34:56Z"
      }
    ],
    "guardianMatch": true
  }
  ```

---


## ❗ Error Handling

- All endpoints return clear error messages and status codes.
- Example error response:
  ```json
  {
    "errors": [
      { "msg": "Valid email is required", "param": "email", "location": "body" }
    ]
  }
  ```
- Unauthorized, forbidden, not found, and duplicate actions are clearly indicated.

---


---

## 📝 Notes
- All endpoints require authentication unless otherwise stated.
- All blockchain-anchored actions return `hederaTx` in the response.
- For any questions, see the README or contact the backend team.
  }
  ```
- **Notes:**
  - Only donors can send HBAR.
  - All transactions are logged in the backend.

---

## 4. User Profile & Wallet Info

### Get Current User
- **Endpoint:** `GET /api/me`
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Response:**
  ```json
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "hederaAccountId": "string",
      "hederaPublicKey": "string"
    }
  }
  ```

---

## 5. Error Handling
- All endpoints return clear error messages and status codes.
- If Hedera account creation or payment fails, the response will include an error message.

---

## 6. Integration Notes
- Always use the JWT token for authenticated requests.
- HBAR balances are always fetched live from Hedera.
- Never expose private keys in the frontend.
- For testnet, initial HBAR balances are limited due to operator account funding.

---

## 7. Example Flow
1. Register user via `/api/v2/register`.
2. Login via `/api/login` to get JWT and wallet info.
3. Display HBAR balance from login response.
4. Make donation via `/api/donations` (donor only).
5. Show transaction status and updated balance.

---

## 8. Contact Backend Team
- For any integration issues, reach out to the backend team for support or clarification.

---

## 9. API Base URL
- Example: `https://haid.onrender.com/api/`

## 10. Donor Dashboard & Impact Stats

### Get Donor Dashboard & Stats
- **Endpoint:** `GET /api/donor/dashboard`
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Purpose:** Returns all donor stats and impact metrics for the authenticated donor.
- **Response:**
  ```json
  {
    "totalContribution": 100.5, // Total HBAR donated by this donor
    "peopleHelped": 12, // Unique recipients
    "locationsReached": ["Lagos", "Abuja"], // Unique event locations
    "impactScore": 1206, // Simple formula: peopleHelped * totalContribution
    "monthlyImpact": {
      "2025-10": 50,
      "2025-09": 30.5
    },
    "donationFlow": [
      { "amount": 10, "recipient": "<userId>", "timestamp": "2025-10-01T12:00:00Z", "txId": "..." },
      { "amount": 5, "recipient": "<userId>", "timestamp": "2025-09-15T09:00:00Z", "txId": "..." }
      // ...
    ],
    "recentDistributions": [
      { "amount": 10, "recipient": "<userId>", "timestamp": "2025-10-01T12:00:00Z", "txId": "..." },
      // ... up to 5 most recent
    ],
    "distributionProgress": {
      "totalEvents": 20,
      "completedEvents": 15,
      "percentCompleted": 75
    },
    "geographicImpact": [
      { "location": "Lagos", "events": 8 },
      { "location": "Abuja", "events": 5 }
    ]
  }
  ```
- **Notes:**
  - All metrics are based on blockchain-anchored records for tamperproof auditability.
  - Only the authenticated donor can access their own stats.
  - `impactScore` is a simple product of people helped and total contribution (can be customized).
  - `monthlyImpact` keys are in `YYYY-MM` format.
  - `donationFlow` is a timeline of all donations (most recent first).
  - `recentDistributions` is the latest 5 donations.
  - `geographicImpact` is based on event locations.
---

This documentation should help the frontend team integrate Hedera payments and wallet features quickly and correctly.