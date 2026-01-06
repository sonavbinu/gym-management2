import express from 'express';
import { getMemberPayments } from '../controllers/paymentController';
import { auth } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';
import { UserRole } from '../types';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get payment history for a member
router.get(
  '/member/:memberId',
  roleCheck(UserRole.ADMIN, UserRole.TRAINER),
  getMemberPayments
);

export default router;
