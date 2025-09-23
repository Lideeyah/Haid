# Haid – Humanitarian Aid with Hedera

**Haid** is a decentralized, transparent, and inclusive humanitarian aid distribution platform built on **Hedera Guardian**. It is designed to ensure **accountable, efficient, and verifiable aid delivery** to vulnerable populations.

---

## Features

* **QR/NFC Wristbands:** Each aid recipient gets a wristband linked to a unique **DID (Decentralized Identifier)**.
* **Aid Distribution Events:** NGOs can create and manage distributions (Morning, Afternoon, Evening).
* **Scan & Verify:** Volunteers scan wristbands; all scans are logged on **Hedera Guardian**.
* **Real-time Dashboards:** NGOs, donors, and auditors can view charts, geo-heatmaps, and KPIs in real time.
* **Multi-language Support:** English, French, Swahili, Hausa, Arabic.
* **Accessibility:** Voice guidance, high contrast mode, large text for ease of use.
* **Exportable Reports:** Generate CSV/PDF reports for audits or donors.

---

## Users & Roles

* **Aid Recipients:** Scan wristbands to receive aid, access multi-language instructions.
* **NGOs / Aid Organizations:** Create events, monitor distributions, generate reports.
* **Donors / Governments:** View live dashboards and impact metrics.
* **Volunteers / Field Staff:** Scan wristbands, verify aid delivery.
* **Auditors / Watchdogs:** Access tamper-proof logs for accountability.

---

## Tech Stack

* **Frontend:** React / Next.js, charts with Recharts/D3.js, geo-maps.
* **Backend:** Node.js / NestJS, REST APIs, role-based access control.
* **Blockchain:** Hedera Guardian for logging distributions and issuing DIDs.
* **Database:** PostgreSQL for off-chain storage, Guardian Indexer for visualization.
* **Hardware:** NFC/QR wristbands integrated with mobile devices.

---

## Hackathon MVP

* Functional QR/NFC wristband scans
* Guardian integration for verifiable logs
* Multi-language, accessible dashboards
* Real-time charts and geo-heatmaps
* CSV/PDF export for audits and donors

---

## Goal

Haid demonstrates **transparent, inclusive, and scalable humanitarian aid delivery**, providing NGOs, donors, and governments with a trusted system for distributing resources efficiently and fairly.



# Haid Backend API

A Node.js backend server with Express and Hedera blockchain integration.

## Features

- ✅ Express.js RESTful API server
- ✅ Health check endpoint (`/health`)
- ✅ Aid collection endpoint with double-claim prevention (`/api/v1/collections`)
- ✅ Hedera Guardian logging for successful collections
- ✅ Hedera testnet integration ready
- ✅ Environment configuration with dotenv
- ✅ Security middleware (Helmet, CORS)
- ✅ Request logging with Morgan
- ✅ Structured folder organization

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
4. Edit `.env` file with your Hedera testnet credentials:
   ```
   HEDERA_OPERATOR_ID=0.0.your_account_id
   HEDERA_OPERATOR_KEY=your_private_key
   HEDERA_GUARDIAN_TOPIC_ID=0.0.your_topic_id
   ```

### Running the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/health` - Returns server status and system information

### API Root
- **GET** `/api/v1` - API information and version

### Events Analytics
- **GET** `/api/v1/events/:id/logs` - Returns all collection records for a specific event
- **GET** `/api/v1/events/:id/analytics` - Returns analytics summary with totalServed and duplicatesPrevented counts
### Aid Collections
- **POST** `/api/v1/collections` - Process aid collection request
  - Body: `{ "refugeeDid": "string", "eventId": "string" }`
  - Returns: Success with Guardian transaction details or error for duplicates
- **GET** `/api/v1/collections/status?refugeeDid=...&eventId=...` - Check collection status

## Project Structure

```
src/
├── controllers/     # Route controllers
├── routes/         # Express route definitions
├── services/       # Business logic services
├── middleware/     # Custom middleware
└── config/         # Configuration files
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `HEDERA_OPERATOR_ID` | Hedera account ID | - |
| `HEDERA_OPERATOR_KEY` | Hedera private key | - |
| `HEDERA_GUARDIAN_TOPIC_ID` | Guardian topic ID for logging | - |
| `API_PREFIX` | API route prefix | /api/v1 |

## Dependencies

- **express** - Web framework
- **@hashgraph/sdk** - Hedera SDK for blockchain integration
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware
- **morgan** - HTTP request logger

## Development

The project uses nodemon for development with auto-restart on file changes.

```bash
npm run dev
```
