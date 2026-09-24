/**
 * Seed Script
 * Creates test data: 1 Admin, 1 User, and 5 sample queries.
 *
 * Run: npm run seed
 * from the backend directory.
 *
 * Test Credentials:
 *   Admin: admin@example.com / Admin@123
 *   User:  user@example.com  / User@123
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Query = require('./src/models/Query');
const connectDB = require('./src/config/db');

const seed = async () => {
  await connectDB();

  console.log('🌱 Starting seed...');

  // Clear existing data
  await User.deleteMany({});
  await Query.deleteMany({});
  console.log('🗑️  Cleared existing users and queries.');

  // Create Admin
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'ADMIN',
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create User
  const user = await User.create({
    name: 'Kumar',
    email: 'user@example.com',
    password: 'User@123',
    role: 'USER',
  });
  console.log(`✅ User created: ${user.email}`);

  // Sample queries
  const sampleQueries = [
    {
      queryId: 'QRY-1001',
      user: user._id,
      subject: 'Login is not working',
      description: 'I cannot login to my account. It shows invalid credentials even though my password is correct.',
      status: 'IN_PROGRESS',
      adminResponse: 'We are looking into the login issue. Will update you shortly.',
    },
    {
      queryId: 'QRY-1002',
      user: user._id,
      subject: 'Payment not processed',
      description: 'I made a payment of Rs.500 but it was deducted from my account and not credited.',
      status: 'RESOLVED',
      adminResponse: 'The payment has been processed and credited to your account. Please check.',
    },
    {
      queryId: 'QRY-1003',
      user: user._id,
      subject: 'Profile update not saving',
      description: 'When I try to update my profile picture, it shows error and does not save.',
      status: 'PENDING',
      adminResponse: '',
    },
    {
      queryId: 'QRY-1004',
      user: user._id,
      subject: 'Cannot download invoice',
      description: 'The invoice download button is not working. It just shows a blank page.',
      status: 'CLOSED',
      adminResponse: 'The invoice download issue has been fixed in the latest release. Please clear cache and try again.',
    },
    {
      queryId: 'QRY-1005',
      user: user._id,
      subject: 'App crashing on startup',
      description: 'The mobile app crashes immediately after the splash screen on Android 13.',
      status: 'PENDING',
      adminResponse: '',
    },
  ];

  await Query.insertMany(sampleQueries);
  console.log(`✅ ${sampleQueries.length} sample queries created.`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('─────────────────────────────────────');
  console.log('  Admin  → admin@example.com / Admin@123');
  console.log('  User   → user@example.com  / User@123');
  console.log('─────────────────────────────────────\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
