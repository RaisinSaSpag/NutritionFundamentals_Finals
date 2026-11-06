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

// Security HTTP headers
app.use(helmet());

// CORS configuration supporting credentials (httpOnly cookie)
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: [clientOrigin, 'http://localhost:5173'],
    credentials: true
  })
);

// Express rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

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
