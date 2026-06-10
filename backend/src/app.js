const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/Logger');
const errorHandler = require('./middleware/errorHandler');
const { sendError } = require('./utils/response');

// Route imports
const authRoutes = require('./routes/v1/auth.routes');
const internshipRoutes = require('./routes/v1/internship.routes');
const applicationRoutes = require('./routes/v1/application.routes');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ─── General Middleware ───────────────────────────────────────────────────────

app.use(express.json({ limit: '10kb' })); // limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize()); // prevent NoSQL injection

// HTTP request logging
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/health',
  })
);

// ─── API Documentation ────────────────────────────────────────────────────────

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Job Board API Docs',
}));


// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/internships', internshipRoutes);
app.use('/api/v1/applications', applicationRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.all('*', (req, res) => {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
});

// ─── Global Error Handler ────────────────────────────────────────────────────

app.use(errorHandler);

module.exports = app;