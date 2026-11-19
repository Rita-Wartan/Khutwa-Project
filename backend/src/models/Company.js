import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    description: { type: String, trim: true },
    logo: {
      filename: { type: String, trim: true },
      url: { type: String, trim: true },
    },
    role: { type: String, default: 'company' },
  },
  { timestamps: true, collection: 'companies' },
);

export default mongoose.model('Company', companySchema);
