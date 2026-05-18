import express from 'express';
import {
  borrowBook,
  returnBook,
  renewLoan,
  getMyLoans,
  getAllLoans
} from '../controllers/loanController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All loan routes require authentication
router.use(protect);

// Borrow a book (frontend should send { bookId } in body)
router.post('/borrow', borrowBook);

// Return a book
router.post('/return/:loanId', returnBook);

// Renew a loan
router.post('/renew/:loanId', renewLoan);

// Get logged-in user's loans
router.get('/my-loans', getMyLoans);

// Admin: get all loans
router.get('/all', isAdmin, getAllLoans);

export default router;
