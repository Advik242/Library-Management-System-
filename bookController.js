import Book from '../models/Book.js';
import Loan from '../models/Loan.js';
import Reservation from '../models/Reservation.js';
import xlsx from 'xlsx';

// Get all books with filters
export const getBooks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      genre,
      availability,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { isActive: true };

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Genre filter
    if (genre && genre !== 'All Genres') {
      query.genre = genre;
    }

    // Availability filter
    if (availability === 'available') {
      query.availableCopies = { $gt: 0 };
    } else if (availability === 'unavailable') {
      query.availableCopies = 0;
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: books,
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

// Get single book
export const getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Get current loans count
    const activeLoans = await Loan.countDocuments({
      book: book._id,
      status: { $in: ['active', 'overdue'] }
    });

    // Get reservation queue
    const reservations = await Reservation.find({
      book: book._id,
      status: 'waiting'
    }).sort('queuePosition').select('queuePosition');

    res.json({
      success: true,
      data: {
        ...book.toObject(),
        activeLoans,
        waitingQueue: reservations.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create book
export const createBook = async (req, res, next) => {
  try {
    const book = await Book.create({
      ...req.body,
      addedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// Update book
export const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// Soft delete book
export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      message: 'Book deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Bulk upload books
export const bulkUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const row of data) {
      try {
        // Check for duplicate ISBN
        const existing = await Book.findOne({ isbn: row.isbn });
        if (existing) {
          results.failed++;
          results.errors.push(`ISBN ${row.isbn} already exists`);
          continue;
        }

        await Book.create({
          title: row.title,
          author: row.author,
          isbn: row.isbn,
          genre: row.genre,
          description: row.description || '',
          publisher: row.publisher || '',
          publishedYear: row.publishedYear,
          totalCopies: row.totalCopies || 1,
          availableCopies: row.availableCopies || row.totalCopies || 1,
          addedBy: req.user._id
        });

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Row error: ${err.message}`);
      }
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// Get genres
export const getGenres = async (req, res, next) => {
  try {
    const genres = await Book.distinct('genre', { isActive: true });

    res.json({
      success: true,
      data: genres
    });
  } catch (error) {
    next(error);
  }
};
