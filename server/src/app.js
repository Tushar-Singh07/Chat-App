import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import statusRoutes from './routes/statusRoutes.js';
import callRoutes from './routes/callRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { corsOriginValidator } from './config/corsConfig.js';

const app = express();

// Production-ready CORS setup supporting Vercel and local development
app.use(
  cors({
    origin: corsOriginValidator,
    credentials: true,
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

// Root and Health Check Endpoints (for Render, uptime probes, and monitors)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WhatsApp Web Clone API is active',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    message: 'Server is running',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/calls', callRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
