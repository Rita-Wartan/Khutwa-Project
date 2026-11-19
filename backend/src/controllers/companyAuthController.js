import bcrypt from 'bcrypt';
import Company from '../models/Company.js';
import generateToken from '../utils/generateToken.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const publicCompany = company => ({ id: company._id, name: company.name, email: company.email, role: company.role });

const validateRegistration = body => {
  const requiredFields = ['name', 'email', 'password', 'phone', 'location'];
  const missing = requiredFields.filter(field => !String(body[field] || '').trim());
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`;
  if (!emailPattern.test(String(body.email).trim())) return 'Invalid email address';
  return null;
};

export async function registerCompany(req, res, next) {
  try {
    const validationError = validateRegistration(req.body);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const email = String(req.body.email).trim().toLowerCase();
    if (await Company.findOne({ email })) return res.status(409).json({ success: false, message: 'Email already exists' });

    const company = await Company.create({
      name: String(req.body.name).trim(), email, password: await bcrypt.hash(req.body.password, 12),
      phone: String(req.body.phone).trim(), location: String(req.body.location).trim(),
      website: req.body.website, description: req.body.description, logo: req.body.logo,
    });
    return res.status(201).json({ success: true, token: generateToken(company._id, company.role), company: publicCompany(company) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Email already exists' });
    return next(error);
  }
}

export async function loginCompany(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const company = await Company.findOne({ email });
    if (!company || !(await bcrypt.compare(password, company.password))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    return res.json({ success: true, token: generateToken(company._id, company.role), company: publicCompany(company) });
  } catch (error) {
    return next(error);
  }
}
