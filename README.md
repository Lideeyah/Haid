# HAID - Humanitarian Aid Immutable Distribution

Blockchain-verified aid distribution system using Hedera Consensus Service (HCS) for transparent, immutable tracking of humanitarian aid to refugees.

## 🎯 System Overview

**Problem:** Aid distribution lacks transparency, leading to fraud, duplicate claims, and donor mistrust.

**Solution:** Every aid transaction is logged to Hedera HCS, creating an immutable audit trail that donors, NGOs, and auditors can verify.

## 🏗️ Architecture
```
[Refugee Wristband QR] → [Volunteer Scans] → [Backend /scan API]
                                                      ↓
                                            [Hedera HCS Topic]
                                                      ↓
                                            [SQLite Cache + Indexer]
                                                      ↓
                                    [Dashboard APIs for Donors/Auditors]
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Hedera testnet credentials
```

Required `.env` variables:
```
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=302e020100300506032b657004220420...
HAID_EVENTS_TOPIC_ID=0.0.TOPIC_ID_1
HAID_SCANS_TOPIC_ID=0.0.TOPIC_ID_2
```

### 3. Run the System
```bash
# Start HCS indexer (subscribes to topic, processes messages)
node haid_indexer.js

# Start API server (in another terminal)
node app.js

# Run acceptance tests
node acceptanceTests.js
```

## 📡 API Endpoints

### **POST /scan** - Log Aid Distribution
Scans wristband and logs event to HCS.

**Request:**
```bash
curl -X POST http://localhost:3000/scan \
  -H "Content-Type: application/json" \
  -d '{
    "wristbandId": "WB-000001",
    "aidType": "FOOD",
    "quantity": 1,
    "location": "Camp Alpha",
    "volunteerId": "volunteer_001"
  }'
```

**Response:**
```json
{
  "success": true,
  "txId": "0.0.12345@1729767000.123456789",
  "did": "did:hedera:testnet:abc123",
  "eventId": "evt_2025_001",
  "hcsTopicId": "0.0.5678"
}
```

### **GET /verify/{did}** - Verify Event Immutability
Returns HCS consensus proof for a DID's events.

**Request:**
```bash
curl http://localhost:3000/verify/did:hedera:testnet:abc123
```

**Response:**
```json
{
  "did": "did:hedera:testnet:abc123",
  "eventsCount": 5,
  "immutable": true,
  "hcsProof": {
    "topicId": "0.0.5678",
    "consensusTimestamp": "1729767000.123456789",
    "sequenceNumber": 42
  }
}
```

### **GET /audit/{did}** - Full Audit Trail
Returns complete history of all events for a DID.

**Request:**
```bash
curl http://localhost:3000/audit/merge/did:hedera:testnet:abc123
```

**Response:**
```json
{
  "did": "did:hedera:testnet:abc123",
  "history": [
    {
      "type": "DID_REGISTRATION",
      "timestamp": "2025-10-24T10:00:00Z",
      "txId": "tx_1729767000"
    },
    {
      "type": "SCAN",
      "eventId": "evt_2025_001",
      "aidType": "FOOD",
      "timestamp": "2025-10-24T11:30:00Z",
      "txId": "tx_1729770600"
    }
  ],
  "overrides": []
}
```

### **GET /api/dashboard/donor** - Donor Dashboard
Statistics for donors to track their aid impact.

**Response:**
```json
{
  "dashboard": "Donor Dashboard",
  "stats": {
    "totalDistributions": 1250,
    "uniqueBeneficiaries": 487,
    "aidTypes": {
      "FOOD": 650,
      "WATER": 300,
      "MEDICAL": 200,
      "SHELTER": 100
    }
  }
}
```

### **GET /api/dashboard/auditor** - Auditor Dashboard
Full transparency for auditors and regulators.

**Response:**
```json
{
  "dashboard": "Auditor Dashboard",
  "audit": {
    "totalEvents": 1250,
    "eventsByType": {
      "DID_REGISTRATION": 487,
      "SCAN": 750,
      "VOUCHER": 13
    },
    "verificationStatus": {
      "verified": 1248,
      "pending": 2
    }
  }
}
```

## 🧪 Testing
```bash
# Run acceptance tests (creates topics, registers DIDs, logs events)
node acceptanceTests.js

# Test scan workflow
curl -X POST http://localhost:3000/scan -d '{"wristbandId":"WB-TEST-001","aidType":"FOOD"}'

# Verify immutability
curl http://localhost:3000/verify/did:hedera:testnet:test123
```

## 📊 Guardian Methodology

See `guardian/methodology.yaml` for the complete policy definition including:
- Roles (NGO Admin, Volunteer, Beneficiary, Auditor)
- Verifiable Credential schemas
- Workflow steps with HCS logging
- Duplicate prevention rules

## 🔐 Security Features

- ✅ **Immutable Logging:** All events written to Hedera HCS (Byzantine fault-tolerant consensus)
- ✅ **DID-based Identity:** Each wristband has a unique DID
- ✅ **Duplicate Prevention:** Cannot claim same aid type within 24 hours
- ✅ **Audit Trail:** Every transaction permanently recorded with consensus timestamp
- ✅ **Verifiable Credentials:** Mock VC issuance for beneficiary registration

## 🎬 Demo Flow

1. **NGO registers refugee:** Creates DID, issues VC, logs to HCS
2. **Volunteer distributes aid:** Scans wristband QR, logs event to HCS
3. **System prevents duplicates:** Checks HCS history before allowing distribution
4. **Donor views impact:** Dashboard shows real-time statistics
5. **Auditor verifies:** Full transparency via immutable HCS records

## 📦 Project Structure
```
haid/
├── guardian/
│   └── methodology.yaml        # Guardian policy definition
├── src/
│   ├── controllers/            # API handlers
│   ├── routes/                 # Express routes
│   ├── services/               # Business logic
│   └── config/                 # Configuration
├── haid_indexer.js             # HCS subscriber
├── acceptanceTests.js          # Integration tests
├── app.js                      # Express server
├── wallets.js                  # DID/wallet simulation
└── README.md                   # This file
```

## 🌍 Impact

- **Transparency:** Donors see exactly where their aid goes
- **Fraud Prevention:** Immutable records prevent duplicate claims
- **Accountability:** NGOs can prove aid delivery to regulators
- **Efficiency:** Real-time tracking reduces administrative overhead

## 📜 License

MIT License - Built for humanitarian aid transparency