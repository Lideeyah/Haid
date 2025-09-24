# Haid API Documentation

## 📚 Overview

The Haid API is a comprehensive RESTful API for humanitarian aid distribution management, built on Node.js with Express and integrated with Hedera Hashgraph for immutable transaction logging.

**Base URL**: `http://localhost:3000` (Development)  
**API Version**: `v1`  
**API Prefix**: `/api/v1`

## 🔗 Interactive Documentation

Visit the interactive Swagger documentation at: **http://localhost:3000/api-docs**

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting Started with Authentication

1. **Register a new user**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/users/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "ngo@example.com",
       "password": "SecurePass123",
       "role": "NGO"
     }'
   ```

2. **Login to get a token**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/users/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "ngo@example.com",
       "password": "SecurePass123"
     }'
   ```

3. **Use the token in subsequent requests**:
   ```bash
   curl -X GET http://localhost:3000/api/v1/events \
     -H "Authorization: Bearer <your-jwt-token>"
   ```

## 📋 API Endpoints

### 👥 User Management

#### Register User
```http
POST /api/v1/users/register
```

**Request Body**:
```json
{
  "email": "ngo@example.com",
  "password": "SecurePass123",
  "role": "NGO"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "ngo@example.com",
    "role": "NGO",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User
```http
POST /api/v1/users/login
```

**Request Body**:
```json
{
  "email": "ngo@example.com",
  "password": "SecurePass123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "id": 1,
    "email": "ngo@example.com",
    "role": "NGO",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 👤 Refugee Management

#### Register Refugee
```http
POST /api/v1/refugees
Authorization: Bearer <token>
```

**Response**:
```json
{
  "message": "Beneficiary registered successfully",
  "did": "did:haid:12345678-1234-4123-8123-123456789012",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### 📅 Event Management

#### Create Event
```http
POST /api/v1/events
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Morning Food Distribution",
  "date": "2024-01-15T10:00:00Z",
  "location": "Refugee Camp A",
  "ngoId": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": 1,
    "name": "Morning Food Distribution",
    "date": "2024-01-15T10:00:00Z",
    "location": "Refugee Camp A",
    "ngoId": 1,
    "status": "active",
    "createdAt": "2024-01-15T09:00:00Z"
  }
}
```

#### Get All Events
```http
GET /api/v1/events
```

**Query Parameters**:
- `location` - Filter by location
- `date` - Filter by date (YYYY-MM-DD format)
- `ngoId` - Filter by NGO ID

**Response**:
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Morning Food Distribution",
      "date": "2024-01-15T10:00:00Z",
      "location": "Refugee Camp A",
      "ngoId": 1,
      "status": "active",
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ],
  "count": 1
}
```

#### Get Event by ID
```http
GET /api/v1/events/:id
```

**Response**:
```json
{
  "success": true,
  "message": "Event retrieved successfully",
  "data": {
    "id": 1,
    "name": "Morning Food Distribution",
    "date": "2024-01-15T10:00:00Z",
    "location": "Refugee Camp A",
    "ngoId": 1,
    "status": "active",
    "createdAt": "2024-01-15T09:00:00Z"
  }
}
```

#### Update Event
```http
PUT /api/v1/events/:id
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Updated Event Name",
  "location": "Updated Location"
}
```

#### Delete Event
```http
DELETE /api/v1/events/:id
Authorization: Bearer <token>
```

#### Export Events to CSV
```http
GET /api/v1/events/export
Authorization: Bearer <token>
```

**Response**: CSV file download

### 🎒 Collection Management

#### Process Collection
```http
POST /api/v1/collections
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "refugeeDid": "did:haid:12345678-1234-4123-8123-123456789012",
  "eventId": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Aid collection recorded successfully",
  "data": {
    "refugeeDid": "did:haid:12345678-1234-4123-8123-123456789012",
    "eventId": 1,
    "timestamp": "2024-01-15T10:30:00Z",
    "transactionId": "0.0.123456@1642248600.123456789",
    "consensusTimestamp": "2024-01-15T10:30:00.123Z"
  }
}
```

#### Manual Collection
```http
POST /api/v1/collections/manual
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "refugeeDid": "did:haid:12345678-1234-4123-8123-123456789012",
  "eventId": 1,
  "reason": "Refugee lost their wristband due to emergency evacuation"
}
```

#### Bulk Collections
```http
POST /api/v1/collections/bulk
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "collections": [
    {
      "refugeeDid": "did:haid:12345678-1234-4123-8123-123456789012",
      "eventId": 1
    },
    {
      "refugeeDid": "did:haid:87654321-4321-1234-1234-210987654321",
      "eventId": 1
    }
  ]
}
```

**Response**:
```json
{
  "successful": [
    {
      "refugeeDid": "did:haid:12345678-1234-4123-8123-123456789012",
      "eventId": 1,
      "timestamp": "2024-01-15T10:30:00Z",
      "transactionId": "0.0.123456@1642248600.123456789",
      "consensusTimestamp": "2024-01-15T10:30:00.123Z"
    }
  ],
  "failed": [
    {
      "refugeeDid": "did:haid:87654321-4321-1234-1234-210987654321",
      "eventId": 1,
      "error": "DUPLICATE_CLAIM"
    }
  ]
}
```

#### Check Collection Status
```http
GET /api/v1/collections/status?refugeeDid=<did>&eventId=<id>
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "refugeeDid": "did:haid:12345678-1234-4123-8123-123456789012",
    "eventId": 1,
    "hasCollected": true,
    "message": "Aid has been collected"
  }
}
```

### 📊 Analytics

#### Get Event Analytics
```http
GET /api/v1/events/:id/analytics
```

**Response**:
```json
{
  "eventId": 1,
  "totalServed": 150,
  "duplicatesPrevented": 5
}
```

#### Get Event Logs
```http
GET /api/v1/events/:id/logs
```

**Response**:
```json
{
  "eventId": 1,
  "logs": [
    {
      "id": "log_001",
      "eventId": "1",
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "success",
      "recipientId": "recipient_001",
      "itemsCollected": ["item1", "item2"],
      "locationHash": "hash_001"
    }
  ],
  "count": 1
}
```

## 🌍 Multi-language Support

The API supports multiple languages through the `Accept-Language` header:

```bash
curl -H "Accept-Language: fr" http://localhost:3000/api/v1/events
```

**Supported Languages**:
- `en` - English (default)
- `fr` - French
- `sw` - Swahili
- `ha` - Hausa
- `ar` - Arabic

## 📝 Error Handling

All API responses follow a consistent error format:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Valid email is required"
      }
    ],
    "status": 400
  }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized (Authentication Required)
- `403` - Forbidden (Insufficient Permissions)
- `404` - Not Found
- `409` - Conflict (Duplicate Resource)
- `429` - Too Many Requests (Rate Limited)
- `500` - Internal Server Error

## 🔒 Security Features

### Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit information included in response headers

### Input Validation
- All inputs are validated using express-validator
- SQL injection protection through parameterized queries
- XSS protection through input sanitization

### Password Security
- Passwords are hashed using bcrypt with salt rounds
- Minimum password requirements enforced
- JWT tokens with expiration

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:coverage

# Run tests with custom script
node scripts/test.js
```

### Test Coverage

The test suite includes:
- **Unit Tests**: Service layer testing
- **Integration Tests**: API endpoint testing
- **Coverage Reports**: HTML and LCOV formats

## 📈 Performance

### Database Optimization
- Connection pooling for PostgreSQL
- Indexed queries for better performance
- Prepared statements for security

### Caching
- In-memory caching for frequently accessed data
- Redis integration ready for production scaling

## 🚀 Deployment

### Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
API_PREFIX=/api/v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=haid_db
DB_USER=postgres
DB_PASSWORD=your_password

# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=your_operator_id
HEDERA_OPERATOR_KEY=your_operator_key
HEDERA_GUARDIAN_TOPIC_ID=your_topic_id

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
```

### Docker Deployment

```bash
# Build image
docker build -t haid-backend .

# Run container
docker run -p 3000:3000 --env-file .env haid-backend
```

## 📞 Support

For API support and questions:
- **Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Issues**: Create an issue in the repository

---

**Built with ❤️ for humanitarian aid distribution**