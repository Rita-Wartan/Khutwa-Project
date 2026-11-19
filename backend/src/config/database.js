import mongoose from 'mongoose';

const DEFAULT_MONGO_URI = 'mongodb://localhost:27017/khutwa';

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI || '';

  if (!mongoUri) {
    console.log('MongoDB connection skipped: MONGO_URI is not configured');
    return null;
  }

  try {
    const connection = await mongoose.connect(mongoUri || DEFAULT_MONGO_URI, {
      dbName: 'khutwa',
    });
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
}
