// Daisy GT - Core Server
// Author: Douglas Owens Jr.
// Ecosystem: DaisyOS / SAYSO

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');

// ============ INITIALIZATION ============
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Database Pool
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ============ MIDDLEWARE ============
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// ============ AUTHENTICATION MIDDLEWARE ============
const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    ecosystem: 'DaisyOS',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ============ WEBSOCKET HANDLER ============
io.on('connection', (socket) => {
  console.log('🏁 Client connected:', socket.id);
  
  socket.on('join_race', (raceId) => {
    socket.join(`race_${raceId}`);
    console.log(`Socket ${socket.id} joined race ${raceId}`);
  });
  
  socket.on('leave_race', (raceId) => {
    socket.leave(`race_${raceId}`);
  });
  
  socket.on('send_chat', (data) => {
    io.to(`race_${data.raceId}`).emit('chat_message', {
      userId: data.userId,
      message: data.message,
      timestamp: new Date()
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ============ EXPORTS ============
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🏁 Daisy GT Server running on port ${PORT}`);
  console.log(`📍 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});

module.exports = { app, io, db, authenticateToken, PORT };