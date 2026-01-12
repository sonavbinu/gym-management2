import express from 'express';
import {
  getAllMembers,
  createMember,
  getMemberById,
  updateMember,
  deleteMember,
  getMyProfile,
  updateMyProfile,
} from '../controllers/memberController';
import { auth } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';
import { UserRole } from '../types';

const router = express.Router();

console.log(' Member routes file loaded');

router.get(
  '/me',
  auth,
  (_req, _res, next) => {
    console.log(' /me route handler called AFTER auth!');
    next();
  },
  getMyProfile
);
router.put('/profile', auth, updateMyProfile);

// Admin routes - with auth and role check
router.get('/', auth, roleCheck(UserRole.ADMIN), getAllMembers);
router.post('/', auth, roleCheck(UserRole.ADMIN), createMember);
router.put('/:id', auth, roleCheck(UserRole.ADMIN), updateMember);
router.delete('/:id', auth, roleCheck(UserRole.ADMIN), deleteMember);
router.get(
  '/:id',
  auth,
  roleCheck(UserRole.ADMIN, UserRole.TRAINER),
  getMemberById
);

export default router;
