import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/database.js';
import { setupSocketIO } from './socket/socketHandler.js';
import { corsOriginValidator } from './config/corsConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from server/.env if present locally
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Setup Socket.IO with production CORS origin validation
const io = new Server(server, {
  cors: {
    origin: corsOriginValidator,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocketIO(io);

// Connect Database & Start Server
const startServer = async () => {
  await connectDB();

  // Explicitly bind to 0.0.0.0 for Render and cloud container routing
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] WhatsApp Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[Server] Health check: http://0.0.0.0:${PORT}/health`);
    console.log(`[Socket.io] Real-time engine ready`);
  });
};

startServer();
