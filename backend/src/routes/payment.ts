import express from 'express';
import {
  getMemberPayments,
  getAllPayments,
  getMyPayments,
  createPayment,
} from '../controllers/paymentController';
import { auth } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';
import { UserRole } from '../types';

const router = express.Router();

router.use(auth);

console.log(' Payment routes loaded');

router.get(
  '/my',
  (_req, _res, next) => {
    console.log(' GET /api/payments/my called');
    next();
  },
  getMyPayments
);
router.post(
  '/create',
  (_req, _res, next) => {
    console.log(' POST /api/payments/create called');
    next();
  },
  createPayment
);

router.get('/', roleCheck(UserRole.ADMIN), getAllPayments);
router.get('/member/:memberId', roleCheck(UserRole.ADMIN), getMemberPayments);

export default router;
