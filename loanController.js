import Loan from '../models/Loan.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Fine from '../models/Fine.js';
import Reservation from '../models/Reservation.js';
import { sendEmail } from '../services/emailService.js';

// Borrow a book
export const borrowBook = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    // Check if user has unpaid fines
    if (req.user.unpaidFines > 0) {
      return res.status(400).json({
        success: false,
        message: `You have unpaid fines of ₹${req.user.unpaidFines}. Please pay before borrowing.`
      });
    }

    // Check borrow limit
    const borrowLimit = req.user.getBorrowLimit();
    if (req.user.currentBorrowCount >= borrowLimit) {
      return res.status(400).json({
        success: false,
        message: `You have reached your borrow limit of ${borrowLimit} books`
      });
    }

    // Check subscription validity
    if (req.user.subscription.plan !== 'free') {
      if (!req.user.subscription.isActive || new Date() > req.user.subscription.endDate) {
        return res.status(400).json({
          success: false,
          message: 'Your subscription has expired'
        });
      }
    }

    // Check book availability
    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (book.availableCopies < 1) {
      return res.status(400).json({
        success: false,
        message: 'No copies available. Please reserve the book.'
      });
    }

    // Check if user already has this book
    const existingLoan = await Loan.findOne({
      user: userId,
      book: bookId,
      status: { $in: ['active', 'overdue'] }
    });

    if (existingLoan) {
      return res.status(400).json({
        success: false,
        message: 'You already have this book borrowed'
      });
    }

    // Calculate due date
    const loanDuration = parseInt(process.env.LOAN_DURATION_DAYS) || 14;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDuration);

    // Create loan
    const loan = await Loan.create({
      user: userId,
      book: bookId,
      dueDate
    });

    // Update book availability
    book.availableCopies -= 1;
    await book.save();

    // Update user borrow count
    await User.findByIdAndUpdate(userId, {
      $inc: { currentBorrowCount: 1 }
    });

    // Populate and return
    await loan.populate('book', 'title author coverImage isbn');

    res.status(201).json({
      success: true,
      data: loan,
      message: 'Book borrowed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Return a book
export const returnBook = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { condition = 'good', notes = '' } = req.body;

    const loan = await Loan.findById(loanId).populate('book');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Book already returned'
      });
    }

    // Calculate fine
    loan.returnDate = new Date();
    const fineAmount = loan.calculateFine();

    // Handle damaged/lost
    let additionalFine = 0;
    if (condition === 'damaged') {
      additionalFine = 200;
      loan.status = 'damaged';
    } else if (condition === 'lost') {
      additionalFine = loan.book.price || 500;
      loan.status = 'lost';
    } else {
      loan.status = 'returned';
    }

    const totalFine = fineAmount + additionalFine;
    loan.fine.amount = totalFine;
    loan.notes = notes;

    // Update book availability (if not lost)
    if (condition !== 'lost') {
      await Book.findByIdAndUpdate(loan.book._id, {
        $inc: { availableCopies: 1 }
      });
    }

    // Update user
    const userUpdate = {
      $inc: { currentBorrowCount: -1 }
    };

    if (totalFine > 0) {
      userUpdate.$inc.totalFines = totalFine;
      userUpdate.$inc.unpaidFines = totalFine;

      // Create fine record
      await Fine.create({
        user: loan.user,
        loan: loan._id,
        amount: totalFine,
        reason: condition === 'good' ? 'overdue' : condition,
        daysOverdue: Math.max(0, Math.ceil((loan.returnDate - loan.dueDate) / (1000 * 60 * 60 * 24)))
      });
    }

    await User.findByIdAndUpdate(loan.user, userUpdate);
    await loan.save();

    // Process next reservation
    await processNextReservation(loan.book._id);

    res.json({
      success: true,
      data: loan,
      message: totalFine > 0 
        ? `Book returned with fine of ₹${totalFine}` 
        : 'Book returned successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Renew a loan
export const renewLoan = async (req, res, next) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (!loan.canRenew()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot renew this loan'
      });
    }

    // Check if someone is waiting
    const waitingReservation = await Reservation.findOne({
      book: loan.book,
      status: 'waiting'
    });

    if (waitingReservation) {
      return res.status(400).json({
        success: false,
        message: 'Cannot renew - someone is waiting for this book'
      });
    }

    // Extend due date
    const loanDuration = parseInt(process.env.LOAN_DURATION_DAYS) || 14;
    loan.dueDate = new Date(loan.dueDate.getTime() + loanDuration * 24 * 60 * 60 * 1000);
    loan.renewalCount += 1;

    await loan.save();

    res.json({
      success: true,
      data: loan,
      message: 'Loan renewed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user's loans
export const getMyLoans = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await Loan.countDocuments(query);
    const loans = await Loan.find(query)
      .populate('book', 'title author coverImage isbn')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: loans,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all loans (admin)
export const getAllLoans = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await Loan.countDocuments(query);
    const loans = await Loan.find(query)
      .populate('user', 'name email')
      .populate('book', 'title author isbn')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: loans,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function
async function processNextReservation(bookId) {
  const nextReservation = await Reservation.findOne({
    book: bookId,
    status: 'waiting'
  }).sort('queuePosition').populate('user');

  if (nextReservation) {
    nextReservation.status = 'ready';
    nextReservation.readyAt = new Date();
    nextReservation.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    await nextReservation.save();

    // Send notification
    await sendEmail({
      to: nextReservation.user.email,
      subject: 'Your reserved book is ready!',
      text: `The book you reserved is now available. Please pick it up within 48 hours.`
    });

    // Reorder queue
    await Reservation.updateMany(
      { book: bookId, status: 'waiting' },
      { $inc: { queuePosition: -1 } }
    );
  }
}  





