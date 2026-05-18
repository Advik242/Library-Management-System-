import express from 'express';
import { recommendBooks } from '../controllers/recommendController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/recommend', recommendBooks);

export default router;
