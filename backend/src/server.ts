import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import memberRoutes from './routes/members';
import trainerRoutes from './routes/trainers';
import subscriptionRoutes from './routes/subscription';
import paymentRoutes from './routes/payment';

// Initialize express app
const app: Application = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Gym Management System API is running',
    timestamp: new Date().toISOString(),
  });
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
});

export default app;
