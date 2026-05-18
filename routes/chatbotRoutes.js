import express from 'express';
import { chatbot } from '../controllers/chatbotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/chatbot', chatbot);

export default router;
