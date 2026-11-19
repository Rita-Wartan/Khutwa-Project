import bcrypt from 'bcrypt';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const publicUser = user => ({ id: user._id, name: user.name, email: user.email, role: user.role });

const validateRegistration = body => {
  const requiredFields = ['name', 'email', 'password', 'phone', 'location'];
  const missing = requiredFields.filter(field => !String(body[field] || '').trim());
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`;
  if (!emailPattern.test(String(body.email).trim())) return 'Invalid email address';
  return null;
};

export async function registerUser(req, res, next) {
  try {
    const validationError = validateRegistration(req.body);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const email = String(req.body.email).trim().toLowerCase();
    if (await User.findOne({ email })) return res.status(409).json({ success: false, message: 'Email already exists' });

    const user = await User.create({
      name: String(req.body.name).trim(), email, password: await bcrypt.hash(req.body.password, 12),
      phone: String(req.body.phone).trim(), location: String(req.body.location).trim(),
      bio: req.body.bio, portfolio: req.body.portfolio, cv: req.body.cv,
    });
    return res.status(201).json({ success: true, token: generateToken(user._id, user.role), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Email already exists' });
    return next(error);
  }
}

export async function loginUser(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    return res.json({ success: true, token: generateToken(user._id, user.role), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}
