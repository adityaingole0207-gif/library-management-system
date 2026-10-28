require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const bookRoutes = require('../routes/books');
const memberRoutes = require('../routes/members');
const loanRoutes = require('../routes/loans');
const adminRoutes = require('../routes/admin');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// MongoDB connection caching for serverless environments (Vercel)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is missing.');
    }

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('✅ Connected to MongoDB Atlas');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Middleware to ensure DB connection before handling API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to connect to database. Please check MONGODB_URI in Vercel environment variables.',
      error: err.message,
    });
  }
});

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Library Management API is running on Vercel Serverless',
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      name: mongoose.connection.name,
      host: mongoose.connection.host,
    },
    timestamp: new Date().toISOString(),
  });
});

// Seed endpoint for easily seeding the cloud Atlas database via browser/curl
app.get('/api/seed', async (req, res) => {
  try {
    const seedData = require('../seedData');
    await seedData();
    res.json({ success: true, message: 'Atlas database successfully seeded with initial books, members, and loans!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Seeding failed', error: err.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
