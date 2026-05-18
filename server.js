import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { startScheduler } from './services/schedulerService.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/booksRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';       // ✅ NEW
import recommendRoutes from './routes/recommendRoutes.js';   // ✅ NEW

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', chatbotRoutes);       // ✅ Chatbot endpoint
app.use('/api', recommendRoutes);     // ✅ Recommendation endpoint

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start scheduler for auto-overdue marking
startScheduler();

// --- Auto-fallback port logic ---
const DEFAULT_PORT = process.env.PORT || 5001;

const server = app.listen(DEFAULT_PORT, () => {
  console.log(`🚀 Server running on port ${DEFAULT_PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = Number(DEFAULT_PORT) + 1;
    app.listen(fallbackPort, () => {
      console.log(`⚠️ Port ${DEFAULT_PORT} busy. Server running on port ${fallbackPort}`);
    });
  } else {
    throw err;
  }
});
