# Haid Backend API

A comprehensive backend API for the Haid humanitarian aid distribution platform, built with Node.js, Express, and PostgreSQL, integrated with Hedera Hashgraph for immutable transaction logging.

## 🚀 Features

### Core Features
- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Refugee Management**: DID generation and QR code creation for beneficiaries
- **Event Management**: Create, update, and manage aid distribution events
- **Collection Processing**: Aid collection with duplicate prevention and Guardian logging
- **Analytics & Reporting**: Real-time analytics and CSV export functionality
- **Multi-language Support**: API responses in English, French, Swahili, Hausa, and Arabic

### Security Features
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation using express-validator
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable cross-origin resource sharing

### Database Features
- **PostgreSQL Integration**: Persistent data storage with connection pooling
- **Database Migrations**: Automatic table creation and indexing
- **Transaction Support**: ACID compliance for data integrity
- **Performance Optimization**: Indexed queries for better performance

### Logging & Monitoring
- **Winston Logging**: Structured logging with multiple transports
- **Request Logging**: Detailed API request/response logging
- **Security Logging**: Authentication and security event logging
- **Error Tracking**: Comprehensive error logging and monitoring

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd haid/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=haid_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # Hedera
   HEDERA_OPERATOR_ID=your_operator_id
   HEDERA_OPERATOR_KEY=your_operator_key
   HEDERA_GUARDIAN_TOPIC_ID=your_topic_id
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb haid_db
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "role": "NGO"
}
```

#### Login User
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Refugee Management

#### Register Refugee
```http
POST /api/v1/refugees
Authorization: Bearer <jwt_token>
```

### Event Management

#### Create Event
```http
POST /api/v1/events
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Morning Food Distribution",
  "date": "2024-01-15T10:00:00Z",
  "location": "Refugee Camp A",
  "ngoId": 1
}
```

#### Get Events
```http
GET /api/v1/events
GET /api/v1/events?location=camp&date=2024-01-15
```

### Collection Management

#### Process Collection
```http
POST /api/v1/collections
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "refugeeDid": "did:haid:12345678-1234-4123-8123-123456789012",
  "eventId": 1
}
```

#### Check Collection Status
```http
GET /api/v1/collections/status?refugeeDid=did:haid:12345678-1234-4123-8123-123456789012&eventId=1
Authorization: Bearer <jwt_token>
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `haid_db` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `JWT_SECRET` | JWT secret key | Required |
| `HEDERA_OPERATOR_ID` | Hedera operator ID | Required |
| `HEDERA_OPERATOR_KEY` | Hedera operator key | Required |
| `HEDERA_GUARDIAN_TOPIC_ID` | Guardian topic ID | Required |

### Database Schema

The application automatically creates the following tables:

- `users` - User accounts and authentication
- `refugees` - Refugee/beneficiary records with DIDs
- `events` - Aid distribution events
- `collections` - Aid collection records
- `collection_logs` - Detailed collection logging

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring

### Logs
- Application logs: `logs/combined.log`
- Error logs: `logs/error.log`
- Exception logs: `logs/exceptions.log`

### Health Check
```http
GET /health
```

## 🔒 Security

### Authentication Flow
1. User registers with email/password
2. Password is hashed using bcrypt
3. JWT token is generated and returned
4. Token is included in Authorization header for protected routes
5. Token is verified on each request

### Authorization Levels
- **Admin**: Full access to all resources
- **NGO**: Can create/manage events and process collections
- **Volunteer**: Can process collections only

## 🌍 Multi-language Support

The API supports multiple languages through the `Accept-Language` header:

```http
Accept-Language: fr  # French
Accept-Language: ar  # Arabic
Accept-Language: sw  # Swahili
Accept-Language: ha  # Hausa
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build image
docker build -t haid-backend .

# Run container
docker run -p 3000:3000 --env-file .env haid-backend
```

### Production Considerations
- Use environment-specific configuration
- Set up proper logging aggregation
- Configure database connection pooling
- Set up monitoring and alerting
- Use HTTPS in production
- Regular security updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for humanitarian aid distribution**