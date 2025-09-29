// index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Swagger setup
const swaggerOptions = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Haid API',
			version: '1.0.0',
			description: 'API documentation for Haid humanitarian aid distribution backend.'
		},
		servers: [
			{ url: 'http://localhost:' + (process.env.PORT || 5000) }
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT'
				}
			}
		},
		security: [{ bearerAuth: [] }]
	},
	apis: ['./src/routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Winston logger setup
const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.json()
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
	]
});

// Startup check for Prisma connection
prisma.$connect()
	.then(() => {
		logger.info('Prisma connected to PostgreSQL');
	})
	.catch((err) => {
		logger.error('Prisma failed to connect:', err);
		process.exit(1);
	});

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Rate limiter for auth endpoints
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // limit each IP to 10 requests per windowMs
	message: 'Too many requests from this IP, please try again later.'
});

// Routes
app.use('/api/auth', authLimiter, require('./src/routes/auth'));
app.use('/api/events', require('./src/routes/events'));
app.use('/api/scans', require('./src/routes/scans'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/volunteers', require('./src/routes/volunteers'));
app.use('/api/donor', require('./src/routes/donor'));
app.use('/api/auditor', require('./src/routes/auditor'));

app.get('/', (req, res) => res.send('Haid API running'));


// Centralized error handler (after all routes)
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
