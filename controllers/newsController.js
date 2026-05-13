const News = require('../models/News');
const xss = require('xss');
const fs = require('fs');
const path = require('path');

// Admin
exports.index = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 15;
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.category) query.category = req.query.category;
  if (req.query.search) {
    query.$or = [
      { title_uz: { $regex: req.query.search, $options: 'i' } },
      { title_ru: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  const [news, total] = await Promise.all([
    News.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('author', 'name'),
    News.countDocuments(query)
  ]);
  res.render('admin/news/index', {
    layout: 'layouts/admin', title: 'News Management',
    news, total, page, pages: Math.ceil(total / limit),
    query: req.query
  });
};

exports.getCreate = (req, res) => {
  res.render('admin/news/form', { layout: 'layouts/admin', title: 'Create News', news: null });
};

exports.postCreate = async (req, res) => {
  try {
    const data = {
      title_uz: xss(req.body.title_uz), title_ru: xss(req.body.title_ru), title_en: xss(req.body.title_en),
      content_uz: req.body.content_uz, content_ru: req.body.content_ru, content_en: req.body.content_en,
      excerpt_uz: xss(req.body.excerpt_uz), excerpt_ru: xss(req.body.excerpt_ru), excerpt_en: xss(req.body.excerpt_en),
      category: xss(req.body.category),
      status: req.body.status || 'draft',
      author: req.session.userId
    };
    if (req.file) data.image = '/uploads/news/' + req.file.filename;
    await News.create(data);
    req.flash('success', 'News created successfully');
    res.redirect('/admin/news');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin/news/create');
  }
};

exports.getEdit = async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) { req.flash('error', 'Not found'); return res.redirect('/admin/news'); }
  res.render('admin/news/form', { layout: 'layouts/admin', title: 'Edit News', news });
};

exports.postEdit = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) { req.flash('error', 'Not found'); return res.redirect('/admin/news'); }
    const fields = ['title_uz','title_ru','title_en','content_uz','content_ru','content_en','excerpt_uz','excerpt_ru','excerpt_en','category','status'];
    fields.forEach(f => { if (req.body[f] !== undefined) news[f] = req.body[f]; });
    if (req.file) {
      if (news.image) { const old = path.join(__dirname, '../public', news.image); if (fs.existsSync(old)) fs.unlinkSync(old); }
      news.image = '/uploads/news/' + req.file.filename;
    }
    await news.save();
    req.flash('success', 'News updated successfully');
    res.redirect('/admin/news');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect(`/admin/news/${req.params.id}/edit`);
  }
};

exports.delete = async (req, res) => {
  const news = await News.findById(req.params.id);
  if (news) {
    if (news.image) { const f = path.join(__dirname, '../public', news.image); if (fs.existsSync(f)) fs.unlinkSync(f); }
    await news.deleteOne();
  }
  req.flash('success', 'Deleted');
  res.redirect('/admin/news');
};

// Public
exports.publicList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const query = { status: 'published' };
  if (req.query.category) query.category = req.query.category;
  const [news, total] = await Promise.all([
    News.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    News.countDocuments(query)
  ]);
  const categories = await News.distinct('category');
  res.render('public/news', {
    layout: 'layouts/public', title: 'News',
    news, total, page, pages: Math.ceil(total / limit),
    categories, query: req.query
  });
};

exports.publicDetail = async (req, res) => {
  const news = await News.findOne({ slug: req.params.slug, status: 'published' });
  if (!news) return res.redirect('/news');
  news.views++;
  await news.save();
  const related = await News.find({ category: news.category, status: 'published', _id: { $ne: news._id } }).limit(3);
  res.render('public/news-detail', { layout: 'layouts/public', title: news[`title_${res.locals.lang}`], news, related });
};
