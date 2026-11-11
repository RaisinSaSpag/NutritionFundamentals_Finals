import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { piiMaskingLogger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import mealRoutes from './routes/meal.routes';
import consumerRoutes from './routes/consumer.routes';
import providerRoutes from './routes/provider.routes';
import appointmentRoutes from './routes/appointment.routes';
import exportRoutes from './routes/export.routes';

const app = express();

// Parse and validate client origins
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000'];

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", ...allowedOrigins],
        frameSrc: ["'self'", 'https://meet.jit.si']
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Strict CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server or health probes) or allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked request from origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Specific strict rate limiter on /api/auth/login to prevent brute-force attacks
const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 login attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Access temporarily restricted. Please try again after 15 minutes.' }
});
app.use('/api/auth/login', authLoginLimiter);

// Request parsing & cookies
app.use(express.json());
app.use(cookieParser());

// PII-masking logger
app.use(piiMaskingLogger);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'tele-nutrition-server',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/consumer', consumerRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/export', exportRoutes);

// Global error handling middleware
app.use(errorHandler);

export default app;
