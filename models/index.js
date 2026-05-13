const mongoose = require('mongoose');

// Contact Message
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
  title_uz: { type: String },
  title_ru: { type: String },
  title_en: { type: String },
  image: { type: String, required: true },
  category: { type: String, default: 'general' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Budget
const budgetSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense'], required: true },
  category_uz: { type: String, required: true },
  category_ru: { type: String, required: true },
  category_en: { type: String, required: true },
  amount: { type: Number, required: true },
  description_uz: { type: String },
  description_ru: { type: String },
  description_en: { type: String },
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
  title_ru: { type: String, required: true },
  title_en: { type: String, required: true },
  content_uz: { type: String },
  content_ru: { type: String },
  content_en: { type: String },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date }
}, { timestamps: true });

// Settings
const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// About Page
const aboutSchema = new mongoose.Schema({
  mission_uz: { type: String },
  mission_ru: { type: String },
  mission_en: { type: String },
  vision_uz: { type: String },
  vision_ru: { type: String },
  vision_en: { type: String },
  history_uz: { type: String },
  history_ru: { type: String },
  history_en: { type: String },
  directors: [{
    name: { type: String },
    position_uz: { type: String },
    position_ru: { type: String },
    position_en: { type: String },
    image: { type: String },
    order: { type: Number, default: 0 }
  }]
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
  About: mongoose.model('About', aboutSchema),
  Stats: mongoose.model('Stats', statsSchema)
};
