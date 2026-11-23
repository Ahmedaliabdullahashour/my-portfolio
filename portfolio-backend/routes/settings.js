const express = require('express');
const PortfolioSettings = require('../models/PortfolioSettings');
const protect = require('../middleware/auth');

const router = express.Router();
router.get('/', async (req, res, next) => {
  try {
    let settings = await PortfolioSettings.findOne();
    if (!settings) {
      settings = await PortfolioSettings.create({});
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
});
router.put('/', protect, async (req, res, next) => {
  try {
    let settings = await PortfolioSettings.findOne();
    if (!settings) {
      settings = await PortfolioSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
