# Haid Backend API

A Node.js backend server with Express and Hedera blockchain integration.

## Features

- ✅ Express.js RESTful API server
- ✅ Health check endpoint (`/health`)
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
