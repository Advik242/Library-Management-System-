import express from 'express';
import {
  createReservation,
  getMyReservations,
  cancelReservation,
  getBookQueue
} from '../controllers/reservationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createReservation);
router.get('/my-reservations', getMyReservations);
router.delete('/:id', cancelReservation);
router.get('/queue/:bookId', isAdmin, getBookQueue);

export default router;
