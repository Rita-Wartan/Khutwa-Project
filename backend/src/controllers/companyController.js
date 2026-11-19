import Company from '../models/Company.js';

const profileFields = ['name', 'phone', 'location', 'website', 'description', 'logo'];

const serializeCompany = company => {
  const data = company.toObject ? company.toObject() : company;
  const { _id, password, ...safeData } = data;
  return { id: _id, ...safeData };
};

function ensureCompany(req, res) {
  if (req.user?.role !== 'company') {
    res.status(403).json({ success: false, message: 'Company access required' });
    return false;
  }
  return true;
}

export async function getCompanyProfile(req, res, next) {
  try {
    if (!ensureCompany(req, res)) return;
    const company = await Company.findById(req.user.id).select('-password');
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    return res.json({ success: true, company: serializeCompany(company) });
  } catch (error) {
    return next(error);
  }
}

export async function updateCompanyProfile(req, res, next) {
  try {
    if (!ensureCompany(req, res)) return;

    const updates = {};
    profileFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) updates[field] = req.body[field];
    });

    const company = await Company.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    return res.json({ success: true, company: serializeCompany(company) });
  } catch (error) {
    return next(error);
  }
}
