import express from 'express';
import {
  getPlans,
  getMySubscription,
  cancelSubscription,
  toggleAutoRenew,
  getSubscriptionHistory
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/plans', getPlans);

router.use(protect);

router.get('/my-subscription', getMySubscription);
router.post('/cancel', cancelSubscription);
router.post('/toggle-auto-renew', toggleAutoRenew);
router.get('/history', getSubscriptionHistory);

export default router;
