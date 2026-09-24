/**
 * QueryDesk Seed Script
 * ─────────────────────────────────────────────
 * Creates test data in MongoDB:
 *   1 ADMIN user
 *   1 USER
 *   5 sample queries across all 4 statuses
 *
 * Run:  npm run seed
 *
 * Test Credentials:
 *   Admin →  admin@example.com  / Admin@123
 *   User  →  user@example.com   / User@123
 * ─────────────────────────────────────────────
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../src/models/User');
const Query = require('../src/models/Query');
const connectDB = require('../src/config/db');

const seed = async () => {
  await connectDB();

  console.log('\n🌱 Starting seed...\n');

  // Clear existing data
  await User.deleteMany({});
  await Query.deleteMany({});
  console.log('🗑️  Cleared existing users and queries.');

  // ─── Create Admin ─────────────────────────────
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'Admin@123', // hashed by pre-save hook
    role: 'ADMIN',
  });
  console.log(`✅ Admin created  →  ${admin.email}`);

  // ─── Create User ──────────────────────────────
  const user = await User.create({
    name: 'Kumar',
    email: 'user@example.com',
    password: 'User@123', // hashed by pre-save hook
    role: 'USER',
  });
  console.log(`✅ User created   →  ${user.email}`);

  // ─── Create Sample Queries ────────────────────
  const sampleQueries = [
    {
      queryId: 'QRY-1001',
      user: user._id,
      subject: 'Login is not working',
      description:
        'I cannot login to my account. It shows invalid credentials even though my password is correct. I have tried resetting the password but the issue persists.',
      status: 'IN_PROGRESS',
      adminResponse: 'We are looking into the login issue. Will update you shortly.',
    },
    {
      queryId: 'QRY-1002',
      user: user._id,
      subject: 'Payment not processed',
      description:
        'I made a payment of Rs.500 but it was deducted from my account and not credited to the service. Transaction ID: TXN-20260923-001.',
      status: 'RESOLVED',
      adminResponse:
        'The payment has been processed and credited to your account. Please check your balance and let us know if you face any further issues.',
    },
    {
      queryId: 'QRY-1003',
      user: user._id,
      subject: 'Profile picture not saving',
      description:
        'When I try to update my profile picture, it shows a generic error and the image does not get saved. I have tried both JPG and PNG formats.',
      status: 'PENDING',
      adminResponse: '',
    },
    {
      queryId: 'QRY-1004',
      user: user._id,
      subject: 'Invoice download not working',
      description:
        'The invoice download button on the billing page opens a blank page instead of downloading the PDF. This is happening for all my invoices.',
      status: 'CLOSED',
      adminResponse:
        'The invoice download issue has been fixed in our latest release. Please clear your browser cache and try again. If the issue persists, contact support.',
    },
    {
      queryId: 'QRY-1005',
      user: user._id,
      subject: 'App crashing on startup',
      description:
        'The mobile app crashes immediately after the splash screen on my Android 13 device. I have tried reinstalling but the issue continues.',
      status: 'PENDING',
      adminResponse: '',
    },
  ];

  await Query.insertMany(sampleQueries);
  console.log(`✅ ${sampleQueries.length} sample queries created.\n`);

  console.log('🎉 Seed completed successfully!');
  console.log('─────────────────────────────────────────────');
  console.log('  Admin  →  admin@example.com  /  Admin@123  ');
  console.log('  User   →  user@example.com   /  User@123   ');
  console.log('─────────────────────────────────────────────\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
