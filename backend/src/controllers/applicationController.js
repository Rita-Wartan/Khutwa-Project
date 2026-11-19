import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';

const validStatuses = new Set(['pending', 'accepted', 'rejected']);

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function ensureRole(req, res, role) {
  if (req.user?.role !== role) {
    res.status(403).json({ success: false, message: `${role} access required` });
    return false;
  }
  return true;
}

export async function applyForJob(req, res, next) {
  try {
    if (!ensureRole(req, res, 'jobseeker')) return;
    const { job: jobId, coverLetter } = req.body;

    if (!jobId) return res.status(400).json({ success: false, message: 'Job ID is required' });
    if (!validId(jobId)) return res.status(400).json({ success: false, message: 'Invalid job ID' });

    const job = await Job.findById(jobId).select('_id');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const existingApplication = await Application.findOne({ user: req.user.id, job: jobId });
    if (existingApplication) return res.status(409).json({ success: false, message: 'Already applied' });

    const application = await Application.create({
      user: req.user.id,
      job: jobId,
      coverLetter,
      status: 'pending',
    });

    return res.status(201).json({ success: true, application });
  } catch (error) {
    return next(error);
  }
}

export async function getMyApplications(req, res, next) {
  try {
    if (!ensureRole(req, res, 'jobseeker')) return;
    const applications = await Application.find({ user: req.user.id })
      .populate({
        path: 'job',
        select: 'title company',
        populate: { path: 'company', select: 'name' },
      })
      .sort({ createdAt: -1 });
    return res.json({ success: true, applications });
  } catch (error) {
    return next(error);
  }
}

export async function getJobApplicants(req, res, next) {
  try {
    if (!ensureRole(req, res, 'company')) return;
    if (!validId(req.params.jobId)) return res.status(400).json({ success: false, message: 'Invalid job ID' });

    const job = await Job.findOne({ _id: req.params.jobId, company: req.user.id }).select('_id title');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or access denied' });

    const applicants = await Application.find({ job: job._id })
      .populate('user', 'name email phone location cv portfolio')
      .populate('job', 'title')
      .sort({ createdAt: -1 });
    return res.json({ success: true, applicants });
  } catch (error) {
    return next(error);
  }
}

export async function updateApplicationStatus(req, res, next) {
  try {
    if (!ensureRole(req, res, 'company')) return;
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid application ID' });

    const { status } = req.body;
    if (!validStatuses.has(status)) return res.status(400).json({ success: false, message: 'Invalid application status' });

    const application = await Application.findById(req.params.id).populate({
      path: 'job',
      select: 'title company',
      populate: { path: 'company', select: 'name' },
    });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (!application.job || application.job.company?._id?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not own this job' });
    }

    application.status = status;
    await application.save();
    return res.json({ success: true, application });
  } catch (error) {
    return next(error);
  }
}

export async function withdrawApplication(req, res, next) {
  try {
    if (!ensureRole(req, res, 'jobseeker')) return;
    if (!validId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid application ID' });
    }

    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    return res.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (error) {
    return next(error);
  }
}
