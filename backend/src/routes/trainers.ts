import express from 'express';
import { getAllTrainers, assignMember } from '../controllers/trainerController';
import { auth } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';
import { UserRole } from '../types';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes accessible by admin and trainers
router.get('/', roleCheck(UserRole.ADMIN, UserRole.TRAINER), getAllTrainers);

// Admin only routes
router.post('/assign', roleCheck(UserRole.ADMIN), assignMember);

export default router;
