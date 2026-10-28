const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      match: [/^[\d-]{10,17}$/, 'Please enter a valid ISBN (10 or 13 digits)'],
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      enum: [
        'Fiction',
        'Non-Fiction',
        'Science',
        'Technology',
        'History',
        'Biography',
        'Self-Help',
        'Romance',
        'Mystery',
        'Fantasy',
        'Science Fiction',
        'Horror',
        'Children',
        'Education',
        'Other',
      ],
    },
    publisher: {
      type: String,
      trim: true,
      maxlength: [100, 'Publisher name cannot exceed 100 characters'],
    },
    publishedYear: {
      type: Number,
      min: [1000, 'Year must be valid'],
      max: [new Date().getFullYear(), 'Year cannot be in the future'],
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies is required'],
      min: [1, 'At least 1 copy is required'],
      default: 1,
    },
    availableCopies: {
      type: Number,
      min: [0, 'Available copies cannot be negative'],
      default: 1,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    coverColor: {
      type: String,
      default: '#4f46e5',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure availableCopies doesn't exceed totalCopies
bookSchema.pre('save', function (next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

// Virtual field: isAvailable
bookSchema.virtual('isAvailable').get(function () {
  return this.availableCopies > 0;
});

bookSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);
