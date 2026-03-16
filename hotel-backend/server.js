const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDatabase } = require('./config/database');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const guestRoutes = require('./routes/guests');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Allow any origin properly
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'J.J.O.J Guest House Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server (only locally, Vercel handles this in serverless functions)
const startServer = async () => {
  await connectDatabase();
  
  if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
    app.listen(PORT, () => {
      console.log(`\n🚀 J.J.O.J Guest House Backend Server`);
      console.log(`📍 Running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`✅ Server started at: ${new Date().toISOString()}\n`);
    });
  }
};

startServer();

// Vercel serverless requires the app to be exported immediately
// We initiate the database connection in the background so it's ready for requests
connectDatabase().catch(console.error);

// Vercel serverless export
module.exports = app;


