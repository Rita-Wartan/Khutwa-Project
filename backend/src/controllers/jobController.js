import mongoose from 'mongoose';
import Job from '../models/Job.js';

const jobFields = [
  'title', 'category', 'description', 'requirements', 'city', 'location',
  'salary', 'showSalary', 'jobType', 'jobLevel', 'experience',
];

const populateJob = query => query
  .populate('company', 'name logo')
  .populate('category', 'name');

function ensureCompany(req, res) {
  if (req.user?.role !== 'company') {
    res.status(403).json({ success: false, message: 'Company access required' });
    return false;
  }
  return true;
}

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function pickJobFields(body) {
  return Object.fromEntries(jobFields
    .filter(field => Object.prototype.hasOwnProperty.call(body, field))
    .map(field => [field, body[field]]));
}

export async function getAllJobs(req, res, next) {
  try {
    const jobs = await populateJob(Job.find().sort({ createdAt: -1 }));
    return res.json({ success: true, jobs });
  } catch (error) {
    return next(error);
  }
}

export async function getJobById(req, res, next) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid job ID' });
    const job = await populateJob(Job.findById(req.params.id));
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    return res.json({ success: true, job });
  } catch (error) {
    return next(error);
  }
}

export async function createJob(req, res, next) {
  try {
    if (!ensureCompany(req, res)) return;
    const job = await Job.create({ ...pickJobFields(req.body), company: req.user.id });
    await job.populate([
      { path: 'company', select: 'name logo' },
      { path: 'category', select: 'name' },
    ]);
    return res.status(201).json({ success: true, job });
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: error.message });
    return next(error);
  }
}

export async function getCompanyJobs(req, res, next) {
  try {
    if (!ensureCompany(req, res)) return;
    const jobs = await populateJob(Job.find({ company: req.user.id }).sort({ createdAt: -1 }));
    return res.json({ success: true, jobs });
  } catch (error) {
    return next(error);
  }
}

export async function updateJob(req, res, next) {
  try {
    if (!ensureCompany(req, res)) return;
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid job ID' });

    const job = await populateJob(Job.findOneAndUpdate(
      { _id: req.params.id, company: req.user.id },
      pickJobFields(req.body),
      { new: true, runValidators: true },
    ));
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or access denied' });
    return res.json({ success: true, job });
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: error.message });
    return next(error);
  }
}

export async function deleteJob(req, res, next) {
  try {
    if (!ensureCompany(req, res)) return;
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid job ID' });

    const job = await Job.findOneAndDelete({ _id: req.params.id, company: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or access denied' });
    return res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    return next(error);
  }
}
