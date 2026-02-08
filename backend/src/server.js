const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// CORS Configuration for Production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://task-manager-frontend-v8h1.onrender.com',
      'https://task-manager-frontend-4n86.onrender.com',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'} - ${new Date().toISOString()}`);
  console.log('Auth Header:', req.headers.authorization ? 'Present' : 'Missing');
  next();
});

// Handle preflight requests
app.options('*', cors(corsOptions));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Project Manager API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      tasks: '/api/v1/tasks'
    },
    cors: {
      allowedOrigins: [
        'https://task-manager-frontend-4n86.onrender.com',
        'http://localhost:3000'
      ]
    }
  });
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      origin: req.headers.origin || 'none',
      allowed: corsOptions.origin ? 'configured' : 'open'
    }
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Test protected route
app.get('/api/v1/test-auth', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No authorization header',
      headers: req.headers
    });
  }
  
  res.json({
    success: true,
    message: 'Authentication successful',
    tokenReceived: authHeader.substring(0, 30) + '...',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    origin: req.headers.origin || 'none'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Allowed Origins:`);
  console.log(`   - https://task-manager-frontend-4n86.onrender.com`);
  console.log(`   - http://localhost:3000`);
  console.log(`📋 API Documentation:`);
  console.log(`   - POST   /api/v1/auth/register`);
  console.log(`   - POST   /api/v1/auth/login`);
  console.log(`   - GET    /api/v1/auth/me (Protected)`);
  console.log(`   - PUT    /api/v1/users/profile (Protected)`);
  console.log(`   - GET    /api/v1/tasks (Protected)`);
  console.log(`   - POST   /api/v1/tasks (Protected)`);
  console.log(`   - GET    /api/v1/health (Public)`);
  console.log(`   - GET    /api/v1/test-auth (Protected Test)`);
});