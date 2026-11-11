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

// SECURITY FIX 2a: Trust Render's reverse proxy
app.set('trust proxy', 1);

const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? '').split(',').map((o) => o.trim()).filter(Boolean);
if (allowedOrigins.length === 0) {
  if (isProd) throw new Error('FATAL: CLIENT_ORIGIN is required in production.');
  allowedOrigins.push('http://localhost:3000', 'http://localhost:5173');
}

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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        const err: any = new Error('Origin not allowed');
        err.statusCode = 403;
        callback(err);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Access temporarily restricted. Please try again after 15 minutes.' }
});
app.use('/api/auth/login', authLoginLimiter);

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many registration attempts.' }
});
app.use('/api/auth/register', registerLimiter);

app.use(express.json());
app.use(cookieParser());

app.use(piiMaskingLogger);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'tele-nutrition-server',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/consumer', consumerRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/export', exportRoutes);

app.use(errorHandler);

export default app;