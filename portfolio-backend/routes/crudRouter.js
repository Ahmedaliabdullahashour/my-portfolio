const express = require('express');
const mongoose = require('mongoose');
const protect = require('../middleware/auth');

module.exports = function crudRouter(Model, sort = { createdAt: -1 }) {
  const router = express.Router();

  
  router.get('/', async (req, res, next) => {
    try {
      const items = await Model.find().sort(sort);
      res.json(items);
    } catch (err) {
      next(err);
    }
  });
  router.get('/:id', async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      const doc = await Model.findById(req.params.id);
      if (!doc) {
        return res.status(404).json({ message: 'Not found' });
      }
      res.json(doc);
    } catch (err) {
      next(err);
    }
  });
  router.post('/', protect, async (req, res, next) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json(doc);
    } catch (err) {
      next(err);
    }
  });
  router.put('/:id', protect, async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) {
        return res.status(404).json({ message: 'Not found' });
      }
      res.json(doc);
    } catch (err) {
      next(err);
    }
  });
  router.delete('/:id', protect, async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) {
        return res.status(404).json({ message: 'Not found' });
      }
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      next(err);
    }
  });
  return router;
};
