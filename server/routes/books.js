const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// GET all books (with search)
router.get('/', async (req, res) => {
  try {
    const { search, genre, available } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }
    if (genre) filter.genre = genre;
    if (available === 'true') filter.availableCopies = { $gt: 0 };

    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: books.length, data: books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create book
router.post('/', async (req, res) => {
  try {
    const { title, author, isbn, genre, publisher, publishedYear, totalCopies, description, coverColor } = req.body;
    const copies = parseInt(totalCopies) || 1;
    const book = new Book({
      title, author, isbn, genre, publisher, publishedYear,
      totalCopies: copies,
      availableCopies: copies,
      description, coverColor,
    });
    const saved = await book.save();
    res.status(201).json({ success: true, message: 'Book added successfully', data: saved });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A book with this ISBN already exists' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update book
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const { title, author, isbn, genre, publisher, publishedYear, totalCopies, description, coverColor } = req.body;

    if (totalCopies !== undefined) {
      const newTotal = parseInt(totalCopies);
      const diff = newTotal - book.totalCopies;
      book.totalCopies = newTotal;
      book.availableCopies = Math.max(0, book.availableCopies + diff);
    }
    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (isbn !== undefined) book.isbn = isbn;
    if (genre !== undefined) book.genre = genre;
    if (publisher !== undefined) book.publisher = publisher;
    if (publishedYear !== undefined) book.publishedYear = publishedYear;
    if (description !== undefined) book.description = description;
    if (coverColor !== undefined) book.coverColor = coverColor;

    const updated = await book.save();
    res.json({ success: true, message: 'Book updated successfully', data: updated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A book with this ISBN already exists' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    // Check for active loans
    const Loan = require('../models/Loan');
    const activeLoans = await Loan.countDocuments({ book: req.params.id, status: { $ne: 'Returned' } });
    if (activeLoans > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: this book has ${activeLoans} active loan(s)`,
      });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
