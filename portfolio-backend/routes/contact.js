const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const protect = require('../middleware/auth');

const router = express.Router();
router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields (name, email, subject, message) are required' });
    }
    const newMessage = await Message.create({ name, email, subject, message });
    res.status(201).json({ message: 'Message sent successfully', id: newMessage._id });
  } catch (err) {
    next(err);
  }
});
router.get('/', protect, async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});
router.patch('/:id/read', protect, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const message = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    next(err);
  }
});
router.delete('/:id', protect, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
