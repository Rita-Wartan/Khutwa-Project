import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    bio: { type: String, trim: true },
    cv: {
      filename: { type: String, trim: true },
      url: { type: String, trim: true },
    },
    portfolio: { type: String, trim: true },
    role: { type: String, enum: ['jobseeker', 'company', 'admin'], default: 'jobseeker' },
  },
  { timestamps: true, collection: 'users' },
);

export default mongoose.model('User', userSchema);
