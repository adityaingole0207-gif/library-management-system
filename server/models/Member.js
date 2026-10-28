const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]{7,15}$/, 'Please enter a valid phone number'],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    membershipId: {
      type: String,
      unique: true,
      trim: true,
    },
    membershipType: {
      type: String,
      enum: ['Student', 'Faculty', 'Staff', 'Public'],
      default: 'Student',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Expired'],
      default: 'Active',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate membership ID before saving
memberSchema.pre('save', async function (next) {
  if (!this.membershipId) {
    const count = await mongoose.model('Member').countDocuments();
    this.membershipId = `LIB${String(count + 1).padStart(5, '0')}`;
  }
  // Set expiry date to 1 year from join date if not set
  if (!this.expiryDate) {
    const expiry = new Date(this.joinDate);
    expiry.setFullYear(expiry.getFullYear() + 1);
    this.expiryDate = expiry;
  }
  next();
});

module.exports = mongoose.model('Member', memberSchema);
