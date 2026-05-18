import express from 'express';
import {
  createPaymentOrder,
  verifyPaymentHandler,
  getPaymentHistory,
  getUserFines
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPaymentHandler);
router.get('/history', getPaymentHistory);
router.get('/fines', getUserFines);

export default router;
