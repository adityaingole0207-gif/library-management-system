const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book is required'],
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member is required'],
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Returned', 'Overdue'],
      default: 'Active',
    },
    fine: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: isOverdue
loanSchema.virtual('isOverdue').get(function () {
  if (this.status === 'Returned') return false;
  return new Date() > this.dueDate;
});

// Virtual: daysOverdue
loanSchema.virtual('daysOverdue').get(function () {
  if (this.status === 'Returned' || new Date() <= this.dueDate) return 0;
  const diff = new Date() - this.dueDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

loanSchema.set('toJSON', { virtuals: true });

// Pre-find middleware to auto-update overdue status
loanSchema.pre(/^find/, function (next) {
  this.populate('book', 'title author isbn')
    .populate('member', 'name email membershipId');
  next();
});

module.exports = mongoose.model('Loan', loanSchema);
