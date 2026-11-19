import 'dotenv/config';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';

const adminEmail = 'admin@khutwa.com';

async function seedAdmin() {
  const connection = await connectDB();
  if (!connection) throw new Error('MONGO_URI is required to seed the admin account');

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log('Admin seed skipped. An account with this email already exists.');
    return;
  }

  await User.create({
    name: 'Khutwa Admin',
    email: adminEmail,
    password: await bcrypt.hash('Admin123456', 12),
    phone: '0000000000',
    location: 'Khutwa',
    role: 'admin',
  });

  console.log('Admin seed complete.');
}

seedAdmin()
  .catch(error => {
    console.error(`Admin seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
