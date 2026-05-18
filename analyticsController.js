import Loan from '../models/Loan.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';

// Get dashboard stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalBooks,
      totalUsers,
      activeLoans,
      totalRevenue
    ] = await Promise.all([
      Book.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Loan.countDocuments({ status: { $in: ['active', 'overdue'] } }),
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const overdueLoans = await Loan.countDocuments({ status: 'overdue' });

    res.json({
      success: true,
      data: {
        totalBooks,
        totalUsers,
        activeLoans,
        overdueLoans,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get revenue chart data
export const getRevenueData = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    let groupBy;
    let startDate = new Date();

    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
      groupBy = { $dayOfMonth: '$createdAt' };
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
      groupBy = { $dayOfMonth: '$createdAt' };
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
      groupBy = { $month: '$createdAt' };
    }

    const revenue = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: revenue
    });
  } catch (error) {
    next(error);
  }
};

// Get user growth data
export const getUserGrowth = async (req, res, next) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const growth = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: growth
    });
  } catch (error) {
    next(error);
  }
};

// Get popular books
export const getPopularBooks = async (req, res, next) => {
  try {
    const popular = await Loan.aggregate([
      {
        $group: {
          _id: '$book',
          borrowCount: { $sum: 1 }
        }
      },
      { $sort: { borrowCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book'
        }
      },
      { $unwind: '$book' },
      {
        $project: {
          title: '$book.title',
          author: '$book.author',
          genre: '$book.genre',
          borrowCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: popular
    });
  } catch (error) {
    next(error);
  }
};

// Get genre distribution
export const getGenreDistribution = async (req, res, next) => {
  try {
    const distribution = await Book.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    next(error);
  }
};
