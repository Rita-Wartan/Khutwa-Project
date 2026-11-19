import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import Category from '../models/Category.js';

const defaultCategories = [
  { name: 'Technology', description: 'Software and IT jobs' },
  { name: 'Marketing', description: 'Marketing and sales jobs' },
  { name: 'Design', description: 'UI/UX and graphic design jobs' },
  { name: 'Engineering', description: 'Engineering jobs' },
  { name: 'Finance', description: 'Accounting and finance jobs' },
  { name: 'Human Resources', description: 'HR jobs' },
];

async function seedCategories() {
  const connection = await connectDB();
  if (!connection) throw new Error('MONGO_URI is required to seed categories');

  const names = defaultCategories.map(category => category.name);
  const existing = await Category.find({ name: { $in: names } }).select('name').lean();
  const existingNames = new Set(existing.map(category => category.name));
  const missing = defaultCategories.filter(category => !existingNames.has(category.name));

  if (missing.length) await Category.insertMany(missing, { ordered: false });
  console.log(`Category seed complete. Inserted ${missing.length} categor${missing.length === 1 ? 'y' : 'ies'}.`);
}

seedCategories()
  .catch(error => {
    console.error(`Category seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
