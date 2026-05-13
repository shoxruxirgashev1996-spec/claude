const { Settings } = require('../models');

// Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  req.flash('error', 'Please log in to continue');
  res.redirect('/admin/login');
};

const isSuperAdmin = (req, res, next) => {
  if (req.session && req.session.role === 'superadmin') return next();
  req.flash('error', 'Access denied. Super Admin only.');
  res.redirect('/admin/dashboard');
};

// Inject settings and user into all views
const injectGlobals = async (req, res, next) => {
  try {
    const settingsDocs = await Settings.find({});
    const settings = {};
    settingsDocs.forEach(s => { settings[s.key] = s.value; });
    res.locals.settings = settings;
    res.locals.currentUser = req.session.userId ? {
      id: req.session.userId,
      name: req.session.userName,
      role: req.session.role
    } : null;
    res.locals.lang = req.session.lang || 'uz';
    res.locals.messages = {
      error: req.flash('error'),
      success: req.flash('success')
    };
    next();
  } catch (err) {
    next(err);
  }
};

// Set language
const setLanguage = (req, res, next) => {
  if (req.query.lang) {
    req.session.lang = req.query.lang;
  }
  next();
};

module.exports = { isAuthenticated, isSuperAdmin, injectGlobals, setLanguage };
