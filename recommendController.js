import Book from '../models/Book.js';
import Loan from '../models/Loan.js';

// Recommend books based on last borrowed genre
export const recommendBooks = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get last borrowed book
    const lastLoan = await Loan.findOne({ user: userId }).populate('book');
    if (!lastLoan) {
      return res.json({ success: true, recommendations: [] });
    }

    const genre = lastLoan.book.genre;

    // Recommend other books in same genre
    const recommendations = await Book.find({
      genre,
      _id: { $ne: lastLoan.book._id }
    }).limit(5);

    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating recommendations' });
  }
};
