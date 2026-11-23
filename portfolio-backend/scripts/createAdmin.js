const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  const args = process.argv.slice(2);
  const email = args[0] || process.env.ADMIN_EMAIL || 'admin@portfolio.local';
  const password = args[1] || process.env.ADMIN_PASSWORD || 'Admin@123456';
  if (!email || !password) {
    console.log('Usage: npm run create-admin -- <email> <password>');
    process.exit(1);
  }
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Error: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  let user = await User.findOne({ email });
  if (user) {
    user.password = password;
    await user.save();
    console.log(`[Admin] Existing admin account password updated for: ${email}`);
  } else {
    user = await User.create({ email, password });
    console.log(`[Admin] New admin account created successfully for: ${email}`);
  }
  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error('[Admin] Failed to create or update admin:', err.message);
  process.exit(1);
});
