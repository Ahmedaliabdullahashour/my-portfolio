const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const Project = require('./models/Project');
const Skill = require('./models/Skill');
const Experience = require('./models/Experience');
const Education = require('./models/Education');
const crudRouter = require('./routes/crudRouter');

const app = express();

const clientUrl = process.env.CLIENT_URL || 'http://localhost:64576';
app.use(cors({
  origin: clientUrl,
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/', (req, res) => res.json({ status: 'Portfolio API running', env: process.env.NODE_ENV || 'development' }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', crudRouter(Project, { order: 1, createdAt: -1 }));
app.use('/api/skills', crudRouter(Skill, { category: 1, level: -1 }));
app.use('/api/experience', crudRouter(Experience, { order: 1, createdAt: -1 }));
app.use('/api/education', crudRouter(Education, { order: 1, createdAt: -1 }));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/upload', require('./routes/upload'));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack || err.message || err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  if (err.name === 'MulterError' || (err.message && err.message.includes('Invalid file type'))) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value entered' });
  }

  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[Server] Portfolio API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('[Server] Critical: Database connection failed. Server not started.', err.message);
    process.exit(1);
  });
