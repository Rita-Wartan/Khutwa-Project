import Category from '../models/Category.js';

export async function getCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.json({ success: true, categories });
  } catch (error) {
    return next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    const description = req.body.description;

    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) return res.status(409).json({ success: false, message: 'Category already exists' });

    const category = await Category.create({ name, description });
    return res.status(201).json({ success: true, category });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Category already exists' });
    if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: error.message });
    return next(error);
  }
}
