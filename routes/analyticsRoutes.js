import express from 'express';
import {
  getDashboardStats,
  getRevenueData,
  getUserGrowth,
  getPopularBooks,
  getGenreDistribution
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, isAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueData);
router.get('/user-growth', getUserGrowth);
router.get('/popular-books', getPopularBooks);
router.get('/genre-distribution', getGenreDistribution);

export default router;
