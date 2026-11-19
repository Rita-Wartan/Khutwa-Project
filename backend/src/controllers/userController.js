import User from '../models/User.js';

const profileFields = ['name', 'phone', 'location', 'bio', 'portfolio', 'cv'];

const serializeUser = user => {
  const data = user.toObject ? user.toObject() : user;
  const { _id, password, ...safeData } = data;
  return { id: _id, ...safeData };
};

function ensureJobSeeker(req, res) {
  if (req.user?.role !== 'jobseeker') {
    res.status(403).json({ success: false, message: 'Job seeker access required' });
    return false;
  }
  return true;
}

export async function getProfile(req, res, next) {
  try {
    if (!ensureJobSeeker(req, res)) return;
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    if (!ensureJobSeeker(req, res)) return;

    const updates = {};
    profileFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
}
