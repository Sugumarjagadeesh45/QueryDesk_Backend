const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const queryRoutes = require('./routes/queryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// Enable CORS for React frontend (allow all for easy deployment)
app.use(cors({
  origin: '*',
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json());

// Root endpoint (So render doesn't show 404 when opening the base URL)
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to QueryDesk API! Server is live.' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'QueryDesk API is running.' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
