import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  googleCallback,
  getMe,
  updateProfile,
  changePassword,
  toggleWishlist
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/wishlist/:bookId', protect, toggleWishlist);

export default router;
