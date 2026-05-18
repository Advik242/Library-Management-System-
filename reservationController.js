import Reservation from '../models/Reservation.js';
import Book from '../models/Book.js';

// Create reservation
export const createReservation = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if already reserved
    const existingReservation = await Reservation.findOne({
      user: userId,
      book: bookId,
      status: { $in: ['waiting', 'ready'] }
    });

    if (existingReservation) {
      return res.status(400).json({
        success: false,
        message: 'You already have a reservation for this book'
      });
    }

    // Get queue position
    const lastInQueue = await Reservation.findOne({
      book: bookId,
      status: 'waiting'
    }).sort('-queuePosition');

    const queuePosition = lastInQueue ? lastInQueue.queuePosition + 1 : 1;

    const reservation = await Reservation.create({
      user: userId,
      book: bookId,
      queuePosition
    });

    await reservation.populate('book', 'title author coverImage');

    res.status(201).json({
      success: true,
      data: reservation,
      message: `You are #${queuePosition} in the queue`
    });
  } catch (error) {
    next(error);
  }
};

// Get my reservations
export const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({
      user: req.user._id,
      status: { $in: ['waiting', 'ready'] }
    })
    .populate('book', 'title author coverImage')
    .sort('-createdAt');

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};

// Cancel reservation
export const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: { $in: ['waiting', 'ready'] }
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    const bookId = reservation.book;
    const oldPosition = reservation.queuePosition;

    reservation.status = 'cancelled';
    await reservation.save();

    // Reorder queue
    await Reservation.updateMany(
      {
        book: bookId,
        status: 'waiting',
        queuePosition: { $gt: oldPosition }
      },
      { $inc: { queuePosition: -1 } }
    );

    res.json({
      success: true,
      message: 'Reservation cancelled'
    });
  } catch (error) {
    next(error);
  }
};

// Get queue for a book
export const getBookQueue = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({
      book: req.params.bookId,
      status: 'waiting'
    })
    .populate('user', 'name email')
    .sort('queuePosition');

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};
