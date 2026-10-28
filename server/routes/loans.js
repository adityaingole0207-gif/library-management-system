const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const Member = require('../models/Member');

// Helper: update overdue status
async function updateOverdueLoans() {
  await Loan.updateMany(
    { status: 'Active', dueDate: { $lt: new Date() } },
    { status: 'Overdue' }
  );
}

// GET all loans
router.get('/', async (req, res) => {
  try {
    await updateOverdueLoans();
    const { status, memberId, bookId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (memberId) filter.member = memberId;
    if (bookId) filter.book = bookId;

    const loans = await Loan.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: loans.length, data: loans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET overdue loans
router.get('/overdue', async (req, res) => {
  try {
    await updateOverdueLoans();
    const loans = await Loan.find({ status: 'Overdue' }).sort({ dueDate: 1 });
    res.json({ success: true, count: loans.length, data: loans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET stats
router.get('/stats', async (req, res) => {
  try {
    await updateOverdueLoans();
    const [total, active, returned, overdue] = await Promise.all([
      Loan.countDocuments(),
      Loan.countDocuments({ status: 'Active' }),
      Loan.countDocuments({ status: 'Returned' }),
      Loan.countDocuments({ status: 'Overdue' }),
    ]);
    res.json({ success: true, data: { total, active, returned, overdue } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single loan
router.get('/:id', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    res.json({ success: true, data: loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST issue a book
router.post('/', async (req, res) => {
  try {
    const { bookId, memberId, dueDate, notes } = req.body;

    if (!bookId || !memberId || !dueDate) {
      return res.status(400).json({ success: false, message: 'Book, member, and due date are required' });
    }

    // Validate book
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.availableCopies < 1) {
      return res.status(400).json({ success: false, message: 'No copies available for this book' });
    }

    // Validate member
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    if (member.status !== 'Active') {
      return res.status(400).json({ success: false, message: `Member account is ${member.status}` });
    }

    // Check for existing active loan of same book by same member
    const existing = await Loan.findOne({
      book: bookId,
      member: memberId,
      status: { $ne: 'Returned' },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This member already has an active loan for this book',
      });
    }

    // Check due date
    const due = new Date(dueDate);
    if (due <= new Date()) {
      return res.status(400).json({ success: false, message: 'Due date must be in the future' });
    }

    // Create loan
    const loan = new Loan({
      book: bookId,
      member: memberId,
      issueDate: new Date(),
      dueDate: due,
      status: 'Active',
      notes,
    });
    await loan.save();

    // Reduce available copies
    book.availableCopies -= 1;
    await book.save();

    const populated = await Loan.findById(loan._id);
    res.status(201).json({ success: true, message: 'Book issued successfully', data: populated });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT return a book
router.put('/:id/return', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    if (loan.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Book already returned' });
    }

    const returnDate = new Date();
    let fine = 0;
    if (returnDate > loan.dueDate) {
      const daysLate = Math.ceil((returnDate - loan.dueDate) / (1000 * 60 * 60 * 24));
      fine = daysLate * 5; // ₹5 per day fine
    }

    loan.status = 'Returned';
    loan.returnDate = returnDate;
    loan.fine = fine;
    await loan.save();

    // Restore available copies
    await Book.findByIdAndUpdate(loan.book._id || loan.book, { $inc: { availableCopies: 1 } });

    const updated = await Loan.findById(loan._id);
    res.json({
      success: true,
      message: fine > 0 ? `Book returned with a fine of ₹${fine}` : 'Book returned successfully',
      data: updated,
      fine,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE loan record
router.delete('/:id', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    if (loan.status !== 'Returned') {
      return res.status(400).json({ success: false, message: 'Cannot delete an active loan. Return the book first.' });
    }
    await Loan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Loan record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
