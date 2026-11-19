import mongoose from 'mongoose';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

export async function getAdminStatistics(req, res, next) {
  try {
    const [userCount, jobseekers, companies, jobs, applications] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'jobseeker' }),
      Company.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
    ]);

    return res.json({
      success: true,
      statistics: { users: userCount + companies, jobseekers, companies, jobs, applications },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminUsers(req, res, next) {
  try {
    const users = await User.find({ role: 'jobseeker' })
      .select('_id name email phone location createdAt')
      .lean();

    return res.json({ success: true, users });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAdminUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select('role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin user' });
    if (user.role !== 'jobseeker') {
      return res.status(403).json({ success: false, message: 'Only jobseeker users can be deleted' });
    }

    await User.deleteOne({ _id: user._id, role: 'jobseeker' });
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminCompanies(req, res, next) {
  try {
    const companies = await Company.find()
      .select('_id name email phone location website description logo createdAt')
      .lean();

    return res.json({ success: true, companies });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAdminCompany(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid company id' });
    }

    const company = await Company.findById(req.params.id).select('_id');
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    await Company.deleteOne({ _id: company._id });
    return res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminJobs(req, res, next) {
  try {
    const jobs = await Job.find()
      .select('_id title company category city location jobType jobLevel experience salary showSalary createdAt')
      .populate('company', 'name logo')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, jobs });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAdminJob(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID' });
    }

    const job = await Job.findById(req.params.id).select('_id');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    await Job.deleteOne({ _id: job._id });
    return res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    return next(error);
  }
}
