import express from 'express';
import {
  getPlans,
  createSubscription,
  getMemberSubscriptions,
  pauseSubscription,
} from '../controllers/subscriptionController';
import { auth } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';
import { UserRole } from '../types';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get subscription plans (all authenticated users)
router.get('/plans', getPlans);

// Admin only routes
router.post('/', roleCheck(UserRole.ADMIN), createSubscription);
router.get(
  '/member/:memberId',
  roleCheck(UserRole.ADMIN, UserRole.TRAINER),
  getMemberSubscriptions
);
router.patch('/:id/pause', roleCheck(UserRole.ADMIN), pauseSubscription);

export default router;
