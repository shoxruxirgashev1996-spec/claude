const mongoose = require('mongoose');

// Contact
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Application
const applicationSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone: { type: String, required: true },
  birth_date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  notes: { type: String, default: '' }
}, { timestamps: true });

// Gallery
const gallerySchema = new mongoose.Schema({
  title_uz: { type: String, default: '' },
  title_ru: { type: String, default: '' },
  title_en: { type: String, default: '' },
  image: { type: String, default: '' },
  video_url: { type: String, default: '' },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  category: { type: String, default: 'general' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Budget
const budgetSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense'], required: true },
  category_uz: { type: String, required: true },
  category_ru: { type: String, default: '' },
  category_en: { type: String, default: '' },
  amount: { type: Number, required: true },
  description_uz: { type: String, default: '' },
  description_ru: { type: String, default: '' },
  description_en: { type: String, default: '' },
  date: { type: Date, required: true, default: Date.now },
  year: { type: Number },
  month: { type: Number }
}, { timestamps: true });

budgetSchema.pre('save', function(next) {
  this.year = new Date(this.date).getFullYear();
  this.month = new Date(this.date).getMonth() + 1;
  next();
});

// Announcement
const announcementSchema = new mongoose.Schema({
  title_uz: { type: String, required: true },
  title_ru: { type: String, default: '' },
  title_en: { type: String, default: '' },
  content_uz: { type: String, default: '' },
  content_ru: { type: String, default: '' },
  content_en: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null }
}, { timestamps: true });

// Settings
const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Staff (Xodimlar)
const staffSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  position_uz: { type: String, default: '' },
  position_ru: { type: String, default: '' },
  position_en: { type: String, default: '' },
  department_uz: { type: String, default: '' },
  department_ru: { type: String, default: '' },
  department_en: { type: String, default: '' },
  bio_uz: { type: String, default: '' },
  bio_ru: { type: String, default: '' },
  bio_en: { type: String, default: '' },
  image: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  education: { type: String, default: '' },
  experience: { type: String, default: '' },
  type: { type: String, enum: ['rahbariyat', 'oqituvchi', 'xodim'], default: 'xodim' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// About (Maktab haqida)
const aboutSchema = new mongoose.Schema({
  mission_uz: { type: String, default: '' },
  mission_ru: { type: String, default: '' },
  mission_en: { type: String, default: '' },
  vision_uz: { type: String, default: '' },
  vision_ru: { type: String, default: '' },
  vision_en: { type: String, default: '' },
  history_uz: { type: String, default: '' },
  history_ru: { type: String, default: '' },
  history_en: { type: String, default: '' }
}, { timestamps: true });

// Stats
const statsSchema = new mongoose.Schema({
  students_count: { type: Number, default: 0 },
  teachers_count: { type: Number, default: 0 },
  awards_count: { type: Number, default: 0 },
  graduates_count: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = {
  Contact: mongoose.model('Contact', contactSchema),
  Application: mongoose.model('Application', applicationSchema),
  Gallery: mongoose.model('Gallery', gallerySchema),
  Budget: mongoose.model('Budget', budgetSchema),
  Announcement: mongoose.model('Announcement', announcementSchema),
  Settings: mongoose.model('Settings', settingsSchema),
  Staff: mongoose.model('Staff', staffSchema),
  About: mongoose.model('About', aboutSchema),
  Stats: mongoose.model('Stats', statsSchema)
};
