const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title_uz: { type: String, required: true },
  title_ru: { type: String, required: true },
  title_en: { type: String, required: true },
  content_uz: { type: String, required: true },
  content_ru: { type: String, required: true },
  content_en: { type: String, required: true },
  excerpt_uz: { type: String },
  excerpt_ru: { type: String },
  excerpt_en: { type: String },
  image: { type: String, default: '' },
  category: { type: String, required: true, default: 'general' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  views: { type: Number, default: 0 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  slug: { type: String, unique: true }
}, { timestamps: true });

newsSchema.pre('save', function(next) {
  if (this.isModified('title_uz')) {
    this.slug = this.title_uz
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80) + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('News', newsSchema);
