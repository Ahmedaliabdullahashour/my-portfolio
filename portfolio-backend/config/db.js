const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('[DB] FATAL ERROR: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }
  try {
    console.log('[DB] Connecting to MongoDB...');
    const conn = await mongoose.connect(uri);
    console.log(`[DB] MongoDB Connected successfully: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('[DB] MongoDB connection failure:', err.message);
    process.exit(1);
  }
};
