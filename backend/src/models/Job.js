import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    description: { type: String, required: true, trim: true },
    requirements: [{ type: String, trim: true }],
    city: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    salary: { type: Number },
    showSalary: { type: Boolean, default: false },
    jobType: { type: String, trim: true },
    jobLevel: { type: String, trim: true },
    experience: { type: String, trim: true },
  },
  { timestamps: true, collection: 'jobs' },
);

export default mongoose.model('Job', jobSchema);
