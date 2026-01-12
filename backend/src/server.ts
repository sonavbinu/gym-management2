import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { seedPlans } from './utils/seedPlans';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import memberRoutes from './routes/members';
import trainerRoutes from './routes/trainers';
import subscriptionRoutes from './routes/subscription';
import paymentRoutes from './routes/payment';
import scheduleRoutes from './routes/schedules';
import { checkExpiredSubscriptions } from './controllers/subscriptionController';

// Initialize express app
const app: Application = express();

// Connect to MongoDB
connectDB();

// Seed default plans
seedPlans();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global request logger
app.use((req, res, next) => {
  console.log(` INCOMING REQUEST: ${req.method} ${req.url}`);
  console.log(' Path:', req.path);
  console.log(' Auth header:', req.headers.authorization ? 'Present' : 'NONE');
  next();
});

// Routes
console.log(' Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/schedules', scheduleRoutes);
console.log(' All routes registered');

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  console.log(' Health check called');
  res.json({
    status: 'OK',
    message: 'Gym Management System API is running',
    timestamp: new Date().toISOString(),
  });
});

// Test route - NO AUTH
app.get('/api/test', (req: Request, res: Response) => {
  console.log(' Test route called - NO AUTH REQUIRED');
  res.json({ message: 'Test route works!', timestamp: new Date() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV}`);
  console.log(` API: http://localhost:${PORT}/api`);

  try {
    checkExpiredSubscriptions();
    setInterval(checkExpiredSubscriptions, 1000 * 60 * 60);
  } catch (e) {
    console.error('Failed to start subscription checker:', e);
  }
});

export default app;
