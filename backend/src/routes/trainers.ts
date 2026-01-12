import express from 'express';
import {
  getAllTrainers,
  createTrainer,
  getTrainerById,
  assignMember,
  unassignMember,
  updateTrainer,
  deleteTrainer,
  getMyAssignedMembers,
  getMyAssignedMembersSubscriptions,
  getMyProfile,
} from '../controllers/trainerController';
import { auth } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';
import { UserRole } from '../types';

const router = express.Router();

router.use(auth);

router.get('/', getAllTrainers);

router.get(
  '/me',
  roleCheck(UserRole.TRAINER),
  (req, res, next) => {
    console.log(' GET /api/trainers/me called');
    next();
  },
  getMyProfile
);
router.get('/my-members', roleCheck(UserRole.TRAINER), getMyAssignedMembers);
router.get(
  '/my-subscriptions',
  roleCheck(UserRole.TRAINER),
  getMyAssignedMembersSubscriptions
);

router.get('/:id', getTrainerById);

router.post('/', roleCheck(UserRole.ADMIN), createTrainer);
router.post('/assign', roleCheck(UserRole.ADMIN), assignMember);
router.post('/unassign', roleCheck(UserRole.ADMIN), unassignMember);
router.put('/:id', roleCheck(UserRole.ADMIN), updateTrainer);
router.delete('/:id', roleCheck(UserRole.ADMIN), deleteTrainer);

export default router;
