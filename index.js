// index.js

require('dotenv').config();
const { createTopic } = require('./src/utils/hedera');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

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


// Startup check for MongoDB connection is handled above with mongoose.connect
// Hedera topic setup
if (!process.env.HEDERA_TOPIC_ID) {
    createTopic().then(topicId => {
        logger.info('Created new Hedera topic: ' + topicId);
        // You should manually add this topicId to your .env file for persistence
    }).catch(err => {
        logger.error('Failed to create Hedera topic:', err);
    });
} else {
    logger.info('Using existing Hedera topic: ' + process.env.HEDERA_TOPIC_ID);
}

const app = express();

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        },
    })
);
const allowedOrigins = [
  "https://haid-web.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
];

app.set("trust proxy", 1); // trust first proxy

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
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
// Mount /api/auth/me before rate limiter so it is not rate limited
const authRouter = require('./src/routes/auth');
const authController = require('./src/controllers/authController');
const authMiddleware = require('./src/middleware/authMiddleware');
app.get('/api/auth/me', authMiddleware, authController.getMe);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/events', require('./src/routes/events'));
app.use('/api/scans', require('./src/routes/scans'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/volunteers', require('./src/routes/volunteers'));
app.use('/api/donor', require('./src/routes/donor'));
app.use('/api/auditor', require('./src/routes/auditor'));
app.use('/api/beneficiaries', require('./src/routes/beneficiaries'));
app.use('/api/ngo', require('./src/routes/ngo'));

app.get('/', (req, res) => res.send('Haid API running'));
// Health check endpoint with beautiful HTML display
app.get('/health', (req, res) => {
    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>🚀 Haid Backend Health</title>
            <style>
                body {
                    background: black;
                    color: #333;
                    font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                .card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                    backdrop-filter: blur(6px);
                    padding: 40px 60px;
                    text-align: center;
                    max-width: 480px;
                }
                h1 {
                    font-size: 2.8rem;
                    margin-bottom: 0.5rem;
                    letter-spacing: 2px;
                }
                .status {
                    font-size: 1.5rem;
                    margin: 1.5rem 0;
                    color: #03c587ff;
                    font-weight: bold;
                    letter-spacing: 1px;
                }
                .logo {
                    width: 80px;
                    margin-bottom: 1rem;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
                }
                .details {
                    font-size: 1.1rem;
                    margin-top: 1.5rem;
                    color: black;
                }
                .heartbeat {
                    display: inline-block;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #00ffae;
                    box-shadow: 0 0 16px #00ffae;
                    animation: pulse 1.2s infinite;
                    margin-right: 8px;
                    vertical-align: middle;
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
            </style>
        </head>
        <body>
            <div class="card">
                <img src="https://res.cloudinary.com/df2q6gyuq/image/upload/v1759163480/haid-logo_uwsyvc.jpg" alt="Haid Logo" class="logo" />
                <h1>Haid Backend</h1>
                <div class="status">
                    <span class="heartbeat"></span>
                    <span>Running & Healthy</span>
                </div>
                <div class="details">
                    API Version: <b>1.0.0</b><br>
                    Environment: <b>${
                      process.env.NODE_ENV || "development"
                    }</b><br>
                    Port: <b>${process.env.PORT || 5000}</b>
                </div>
                <div style="margin-top:2rem;font-size:1rem;">
                    <span>🚀 <b>Ready to serve humanitarian aid distribution!</b></span>
                </div>
            </div>
        </body>
        </html>
    `);
});


// Centralized error handler (after all routes)
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
