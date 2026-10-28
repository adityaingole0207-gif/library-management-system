require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const bookRoutes = require('./routes/books');
const memberRoutes = require('./routes/members');
const loanRoutes = require('./routes/loans');
const adminRoutes = require('./routes/admin');
const seedData = require('./seedData');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  res.json({
    status: 'ok',
    message: 'Library Management API is running',
    database: {
      status: statusMap[dbStatus] || 'unknown',
      name: mongoose.connection.name,
      host: mongoose.connection.host,
    },
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

async function startServer() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';
  let connected = false;

  console.log(`🔌 Attempting connection to MongoDB at: ${MONGODB_URI}`);
  try {
    // Attempt standard connection with 3s timeout
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to local/external MongoDB successfully!');
    console.log(`   Database: ${mongoose.connection.name}`);
    connected = true;
  } catch (err) {
    console.warn(`⚠️  Could not connect to ${MONGODB_URI} (${err.message})`);
    console.log('🚀 Launching embedded in-memory MongoDB instance for seamless project demo...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri('library_management');
      console.log(`📦 Embedded MongoDB started at: ${memoryUri}`);

      await mongoose.connect(memoryUri);
      console.log('✅ Connected to Embedded MongoDB successfully!');
      connected = true;

      // Automatically seed when starting fresh in-memory instance
      console.log('🌱 Populating demo data in embedded database...');
      await seedData();
      console.log('✨ Demo database successfully seeded!');
    } catch (memErr) {
      console.error('❌ Failed to launch embedded MongoDB:', memErr.message);
    }
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Library Management Backend running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   DB Status: ${connected ? 'Active & Ready' : 'Connection Failed'}`);
    console.log(`======================================================\n`);
  });
}

startServer();
