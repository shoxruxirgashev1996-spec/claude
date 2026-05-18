const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const newsController = require('../controllers/newsController');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const staffController = require('../controllers/staffController');
const { isAuthenticated, isSuperAdmin } = require('../middleware');
const { uploadNews, uploadGallery, uploadStaff } = require('../config/multer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Auth ──────────────────────────────────────────────────────────────────────
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', isAuthenticated, dashboardController.getDashboard);

// ── News ──────────────────────────────────────────────────────────────────────
router.get('/news', isAuthenticated, newsController.index);
router.get('/news/create', isAuthenticated, newsController.getCreate);
router.post('/news/create', isAuthenticated, uploadNews.single('image'), newsController.postCreate);
router.get('/news/:id/edit', isAuthenticated, newsController.getEdit);
router.post('/news/:id/edit', isAuthenticated, uploadNews.single('image'), newsController.postEdit);
router.post('/news/:id/delete', isAuthenticated, newsController.delete);

// ── Staff (Xodimlar) ──────────────────────────────────────────────────────────
router.get('/staff', isAuthenticated, staffController.index);
router.get('/staff/create', isAuthenticated, staffController.getCreate);
router.post('/staff/create', isAuthenticated, uploadStaff.single('image'), staffController.postCreate);
router.get('/staff/:id/edit', isAuthenticated, staffController.getEdit);
router.post('/staff/:id/edit', isAuthenticated, uploadStaff.single('image'), staffController.postEdit);
router.post('/staff/:id/delete', isAuthenticated, staffController.delete);

// ── Contacts ──────────────────────────────────────────────────────────────────
router.get('/contacts', isAuthenticated, adminController.getContacts);
router.post('/contacts/:id/read', isAuthenticated, adminController.markRead);
router.post('/contacts/:id/delete', isAuthenticated, adminController.deleteContact);

// ── Applications ──────────────────────────────────────────────────────────────
router.get('/applications', isAuthenticated, adminController.getApplications);
router.post('/applications/:id/status', isAuthenticated, adminController.updateAppStatus);
router.post('/applications/:id/delete', isAuthenticated, adminController.deleteApp);

// ── Gallery ───────────────────────────────────────────────────────────────────
router.get('/gallery', isAuthenticated, adminController.getGallery);
router.post('/gallery/upload', isAuthenticated, uploadGallery.single('image'), adminController.uploadGallery);
router.post('/gallery/:id/delete', isAuthenticated, adminController.deleteGallery);

// ── Budget ────────────────────────────────────────────────────────────────────
router.get('/budget', isAuthenticated, adminController.getBudget);
router.post('/budget/create', isAuthenticated, adminController.createBudget);
router.post('/budget/:id/delete', isAuthenticated, adminController.deleteBudget);

// ── Announcements ─────────────────────────────────────────────────────────────
router.get('/announcements', isAuthenticated, adminController.getAnnouncements);
router.post('/announcements/create', isAuthenticated, adminController.createAnnouncement);
router.post('/announcements/:id/toggle', isAuthenticated, adminController.toggleAnnouncement);
router.post('/announcements/:id/delete', isAuthenticated, adminController.deleteAnnouncement);

// ── About ─────────────────────────────────────────────────────────────────────
router.get('/about', isAuthenticated, adminController.getAbout);
router.post('/about/save', isAuthenticated, adminController.saveAbout);

// ── Settings ──────────────────────────────────────────────────────────────────
const multiUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = file.fieldname === 'logo' ? 'logos' : 'banners';
      const dir = path.join(__dirname, '../public/uploads', folder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  }),
  fileFilter: (req, file, cb) => {
    if (/image/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Faqat rasm!'));
  }
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner_image', maxCount: 1 },
  { name: 'bg_image', maxCount: 1 }
]);

router.get('/settings', isAuthenticated, adminController.getSettings);
router.post('/settings/save', isAuthenticated, multiUpload, adminController.saveSettings);
router.post('/settings/stats', isAuthenticated, adminController.saveStats);
router.post('/settings/password', isAuthenticated, userController.changePassword);

// ── Users (Super Admin only) ──────────────────────────────────────────────────
router.get('/users', isAuthenticated, isSuperAdmin, userController.getUsers);
router.post('/users/create', isAuthenticated, isSuperAdmin, userController.createUser);
router.post('/users/:id/delete', isAuthenticated, isSuperAdmin, userController.deleteUser);
router.post('/users/:id/toggle', isAuthenticated, isSuperAdmin, userController.toggleUser);

module.exports = router;
