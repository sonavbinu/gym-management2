import express from 'express';
import {
  createSubscription,
  getMemberSubscriptions,
  pauseSubscription,
  assignPlanToMember,
  getAllSubscriptions,
  resumeSubscription,
  getMySubscriptions,
  pauseMySubscription,
  resumeMySubscription,
  subscribeMe,
  getPlans,
  cancelMySubscription,
  deleteSubscription,
} from '../controllers/subscriptionController';
import {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/planController';
import { auth } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';
import { UserRole } from '../types';

const router = express.Router();

router.use(auth);

console.log(' Subscription routes loaded');

router.get('/plans', getAllPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

router.get(
  '/my',
  (req, res, next) => {
    console.log(' GET /api/subscriptions/my called');
    next();
  },
  getMySubscriptions
);
router.post(
  '/me/subscribe',
  (req, res, next) => {
    console.log(' POST /api/subscriptions/me/subscribe called');
    next();
  },
  subscribeMe
);
router.patch(
  '/my/:id/pause',
  (req, res, next) => {
    console.log(' PATCH /api/subscriptions/my/:id/pause called');
    next();
  },
  pauseMySubscription
);
router.patch(
  '/my/:id/resume',
  (req, res, next) => {
    console.log(' PATCH /api/subscriptions/my/:id/resume called');
    next();
  },
  resumeMySubscription
);
router.patch(
  '/my/:id/cancel',
  (req, res, next) => {
    console.log(' PATCH /api/subscriptions/my/:id/cancel called');
    next();
  },
  cancelMySubscription
);

// Subscription routes
router.get('/', roleCheck(UserRole.ADMIN), getAllSubscriptions);
router.post('/', roleCheck(UserRole.ADMIN), createSubscription);
router.post('/assign/:memberId', roleCheck(UserRole.ADMIN), assignPlanToMember);
router.get(
  '/member/:memberId',
  roleCheck(UserRole.ADMIN, UserRole.TRAINER),
  getMemberSubscriptions
);
router.patch('/:id/pause', roleCheck(UserRole.ADMIN), pauseSubscription);
router.patch('/:id/resume', roleCheck(UserRole.ADMIN), resumeSubscription);
router.delete('/:id', roleCheck(UserRole.ADMIN), deleteSubscription);

export default router;
