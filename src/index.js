const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Config imports
const { testConnection } = require('./config/database');
const { initializeSocket } = require('./config/socket');

// Models import
const { syncDatabase } = require('./models');

// Route imports
const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/lists');
const itemRoutes = require('./routes/items');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// ✅ CORS - Allow all origins (MUST be before other middleware)
app.use(cors());

// Helmet with relaxed settings for API
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🛒 Shared Grocery List API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/lists', itemRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await testConnection();
    await syncDatabase();
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   🛒 Shared Grocery List API                              ║
    ║                                                           ║
    ║   🚀 Server running on port ${PORT}                          ║
    ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                          ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();