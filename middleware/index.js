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
    // Default settings (agar DB ulanmagan bo'lsa ham ishlasin)
    let settings = {
      primary_color: '#1e3a5f',
      secondary_color: '#c8a84b',
      site_name_uz: 'Prezident Maktabi',
      site_name_ru: 'Президентская Школа',
      site_name_en: 'Presidential School',
      bg_type: 'color'
    };

    try {
      const settingsDocs = await Settings.find({}).lean();
      settingsDocs.forEach(s => { settings[s.key] = s.value; });
    } catch (dbErr) {
      // DB ulanmagan bo'lsa default settings ishlatiladi
      console.warn('⚠️  Settings DB dan yuklanmadi, default ishlatilmoqda');
    }

    res.locals.settings = settings;
    res.locals.currentUser = req.session && req.session.userId ? {
      id: req.session.userId,
      name: req.session.userName,
      role: req.session.role
    } : null;
    res.locals.lang = (req.session && req.session.lang) || 'uz';
    res.locals.messages = {
      error: req.flash ? req.flash('error') : [],
      success: req.flash ? req.flash('success') : []
    };
    next();
  } catch (err) {
    // Hech narsa bo'lmasin, davom etsin
    res.locals.settings = { primary_color: '#1e3a5f', secondary_color: '#c8a84b' };
    res.locals.currentUser = null;
    res.locals.lang = 'uz';
    res.locals.messages = { error: [], success: [] };
    next();
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
