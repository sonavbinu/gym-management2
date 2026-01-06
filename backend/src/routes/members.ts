import express from 'express';
import {
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
} from '../controllers/memberController';
import { auth } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';
import { UserRole } from '../types';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Admin only routes
router.get('/', roleCheck(UserRole.ADMIN), getAllMembers);
router.get('/:id', roleCheck(UserRole.ADMIN, UserRole.TRAINER), getMemberById);
router.put('/:id', roleCheck(UserRole.ADMIN), updateMember);
router.delete('/:id', roleCheck(UserRole.ADMIN), deleteMember);

export default router;
