import express from 'express';
import {
  createSchedule,
  getMemberSchedule,
  updateSchedule,
  updateExerciseStatus,
  getMemberProgressStats,
} from '../controllers/scheduleController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

// Routes
router.post(
  '/',
  protect,
  authorize(UserRole.TRAINER, UserRole.ADMIN),
  createSchedule
);

router.get(
  '/member/:memberId',
  protect,
  // Both trainer and member should be able to see it...
  authorize(UserRole.TRAINER, UserRole.ADMIN, UserRole.MEMBER),
  getMemberSchedule
);

router.get(
  '/member/:memberId/stats',
  protect,
  authorize(UserRole.TRAINER, UserRole.ADMIN, UserRole.MEMBER),
  getMemberProgressStats
);

router.put(
  '/:id',
  protect,
  authorize(UserRole.TRAINER, UserRole.ADMIN),
  updateSchedule
);

router.patch(
  '/:id/status',
  protect,
  authorize(UserRole.MEMBER, UserRole.TRAINER, UserRole.ADMIN),
  updateExerciseStatus
);

export default router;
