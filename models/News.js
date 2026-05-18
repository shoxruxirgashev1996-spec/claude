const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title_uz: { type: String, required: true },
  title_ru: { type: String, default: '' },
  title_en: { type: String, default: '' },
  content_uz: { type: String, required: true },
  content_ru: { type: String, default: '' },
  content_en: { type: String, default: '' },
  excerpt_uz: { type: String, default: '' },
  excerpt_ru: { type: String, default: '' },
  excerpt_en: { type: String, default: '' },
  image: { type: String, default: '' },
  video_url: { type: String, default: '' },
  category: { type: String, default: 'general' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  views: { type: Number, default: 0 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  slug: { type: String, unique: true, sparse: true }
}, { timestamps: true });

newsSchema.pre('save', function(next) {
  if (this.isModified('title_uz') || !this.slug) {
    const base = (this.title_uz || 'post')
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60);
    this.slug = base + '-' + Date.now();
  }
  // RU/EN mavjud bo'lmasa UZ dan ko'chirish
  if (!this.title_ru) this.title_ru = this.title_uz;
  if (!this.title_en) this.title_en = this.title_uz;
  if (!this.content_ru) this.content_ru = this.content_uz;
  if (!this.content_en) this.content_en = this.content_uz;
  next();
});

module.exports = mongoose.model('News', newsSchema);
