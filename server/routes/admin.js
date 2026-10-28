const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Loan = require('../models/Loan');

// GET dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Update overdue loans first
    await Loan.updateMany(
      { status: 'Active', dueDate: { $lt: new Date() } },
      { status: 'Overdue' }
    );

    const [
      totalBooks,
      totalMembers,
      activeLoans,
      overdueLoans,
      totalLoans,
      availableBooks,
    ] = await Promise.all([
      Book.countDocuments(),
      Member.countDocuments(),
      Loan.countDocuments({ status: 'Active' }),
      Loan.countDocuments({ status: 'Overdue' }),
      Loan.countDocuments(),
      Book.countDocuments({ availableCopies: { $gt: 0 } }),
    ]);

    // Genre distribution
    const genreStats = await Book.aggregate([
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Recent loans (last 5)
    const recentLoans = await Loan.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalBooks,
        totalMembers,
        activeLoans,
        overdueLoans,
        totalLoans,
        availableBooks,
        genreStats,
        recentLoans,
        dbInfo: {
          name: mongoose.connection.name,
          host: mongoose.connection.host,
          status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
          collections: ['books', 'members', 'loans'],
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET database info
router.get('/db-info', async (req, res) => {
  try {
    const dbName = mongoose.connection.name;
    res.json({
      success: true,
      data: {
        databaseName: dbName,
        host: mongoose.connection.host || 'localhost',
        port: mongoose.connection.port || 27017,
        status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        collections: ['books', 'members', 'loans'],
        mongooseVersion: mongoose.version,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
