# Hedera Payment Integration API Documentation

This document describes the backend payment integration using Hedera Hashgraph for the HAID platform. It covers user onboarding, HBAR wallet creation, payment endpoints, and how to retrieve HBAR balances. This guide is for frontend developers integrating payment and wallet features.

---

## 1. User Onboarding & Hedera Wallet Creation

### Registration (v2)
- **Endpoint:** `POST /api/v2/register`
- **Purpose:** Registers a user and automatically creates a custodial Hedera wallet.
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
- **Initial HBAR Funding:**
  - Donor: 5 HBAR
  - NGO: 3 HBAR
  - Beneficiary: 2 HBAR
  - Others: 3 HBAR

---

## 2. Login & HBAR Balance

### Login
- **Endpoint:** `POST /api/login`
- **Purpose:** Authenticates user and returns JWT + Hedera wallet info + live HBAR balance.
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
      "hbarBalance": "number"
    }
  }
  ```
- **Note:** `hbarBalance` is fetched live from Hedera, not stored in the database.

---

## 3. HBAR Payment (Donation)

### Make a Donation
- **Endpoint:** `POST /api/donations`
- **Purpose:** Donor sends HBAR to NGO or beneficiary.
- **Request Body:**
  ```json
  {
    "recipientAccountId": "string", // Hedera account ID of recipient
    "amount": "number", // Amount in HBAR
    "note": "Donation for October campaign"
  }
  ```
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Response:**
  ```json
  {
    "message": "Donation successful",
    "transactionId": "string",
    "amount": "number",
    "recipientAccountId": "string"
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