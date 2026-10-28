const express = require('express');
const router = express.Router();
const Member = require('../models/Member');

// GET all members (with search)
router.get('/', async (req, res) => {
  try {
    const { search, status, membershipType } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { membershipId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (membershipType) filter.membershipType = membershipType;

    const members = await Member.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: members.length, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single member
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create member
router.post('/', async (req, res) => {
  try {
    const member = new Member(req.body);
    const saved = await member.save();
    res.status(201).json({ success: true, message: 'Member registered successfully', data: saved });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A member with this ${field} already exists`,
      });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update member
router.put('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, message: 'Member updated successfully', data: member });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A member with this ${field} already exists`,
      });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE member
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    const Loan = require('../models/Loan');
    const activeLoans = await Loan.countDocuments({ member: req.params.id, status: { $ne: 'Returned' } });
    if (activeLoans > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: this member has ${activeLoans} active loan(s)`,
      });
    }

    await Member.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
