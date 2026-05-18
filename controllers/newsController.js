const News = require('../models/News');
const xss = require('xss');
const fs = require('fs');
const path = require('path');

// ── Admin ──────────────────────────────────────────────────────────────────────
exports.index = async (req, res) => {
  try {
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
      News.find(query).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).populate('author','name'),
      News.countDocuments(query)
    ]);
    res.render('admin/news/index', {
      layout: 'layouts/admin', title: 'News Management',
      news, total, page, pages: Math.ceil(total/limit), query: req.query
    });
  } catch(err) {
    console.error('News index error:', err.message);
    req.flash('error', err.message);
    res.redirect('/admin/dashboard');
  }
};

exports.getCreate = (req, res) => {
  res.render('admin/news/form', { layout: 'layouts/admin', title: 'Create News', news: null });
};

exports.postCreate = async (req, res) => {
  try {
    const data = {
      title_uz: xss(req.body.title_uz || ''),
      title_ru: xss(req.body.title_ru || req.body.title_uz || ''),
      title_en: xss(req.body.title_en || req.body.title_uz || ''),
      content_uz: req.body.content_uz || '',
      content_ru: req.body.content_ru || req.body.content_uz || '',
      content_en: req.body.content_en || req.body.content_uz || '',
      excerpt_uz: xss(req.body.excerpt_uz || ''),
      excerpt_ru: xss(req.body.excerpt_ru || req.body.excerpt_uz || ''),
      excerpt_en: xss(req.body.excerpt_en || req.body.excerpt_uz || ''),
      category: xss(req.body.category || 'general'),
      status: req.body.status || 'draft',
      video_url: req.body.video_url || '',
      author: req.session.userId
    };
    if (req.file) data.image = '/uploads/news/' + req.file.filename;
    if (!data.title_uz) throw new Error('Sarlavha (UZ) kiritish shart!');
    if (!data.content_uz) throw new Error('Matn (UZ) kiritish shart!');
    await News.create(data);
    req.flash('success', "Yangilik muvaffaqiyatli qo'shildi!");
    res.redirect('/admin/news');
  } catch (err) {
    console.error('News create error:', err.message);
    req.flash('error', err.message);
    res.redirect('/admin/news/create');
  }
};

exports.getEdit = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) { req.flash('error', 'Topilmadi'); return res.redirect('/admin/news'); }
    res.render('admin/news/form', { layout: 'layouts/admin', title: 'Edit News', news });
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('/admin/news');
  }
};

exports.postEdit = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) { req.flash('error', 'Topilmadi'); return res.redirect('/admin/news'); }
    news.title_uz = req.body.title_uz || news.title_uz;
    news.title_ru = req.body.title_ru || req.body.title_uz || news.title_ru;
    news.title_en = req.body.title_en || req.body.title_uz || news.title_en;
    news.content_uz = req.body.content_uz || news.content_uz;
    news.content_ru = req.body.content_ru || req.body.content_uz || news.content_ru;
    news.content_en = req.body.content_en || req.body.content_uz || news.content_en;
    news.excerpt_uz = req.body.excerpt_uz || '';
    news.excerpt_ru = req.body.excerpt_ru || req.body.excerpt_uz || '';
    news.excerpt_en = req.body.excerpt_en || req.body.excerpt_uz || '';
    news.category = req.body.category || news.category;
    news.status = req.body.status || news.status;
    news.video_url = req.body.video_url || '';
    if (req.file) {
      if (news.image) { const old = path.join(__dirname,'../public', news.image); if(fs.existsSync(old)) fs.unlinkSync(old); }
      news.image = '/uploads/news/' + req.file.filename;
    }
    await news.save();
    req.flash('success', 'Yangilik yangilandi!');
    res.redirect('/admin/news');
  } catch (err) {
    console.error('News edit error:', err.message);
    req.flash('error', err.message);
    res.redirect(`/admin/news/${req.params.id}/edit`);
  }
};

exports.delete = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (news) {
      if (news.image) { const f = path.join(__dirname,'../public', news.image); if(fs.existsSync(f)) fs.unlinkSync(f); }
      await news.deleteOne();
    }
    req.flash('success', "O'chirildi");
  } catch(err) {
    req.flash('error', err.message);
  }
  res.redirect('/admin/news');
};

// ── Public ─────────────────────────────────────────────────────────────────────
exports.publicList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const query = { status: 'published' };
    if (req.query.category) query.category = req.query.category;
    const [news, total, categories] = await Promise.all([
      News.find(query).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit),
      News.countDocuments(query),
      News.distinct('category')
    ]);
    res.render('public/news', {
      layout: 'layouts/public', title: 'Yangiliklar',
      news, total, page, pages: Math.ceil(total/limit), categories, query: req.query
    });
  } catch(err) {
    res.redirect('/');
  }
};

exports.publicDetail = async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug, status: 'published' });
    if (!news) return res.redirect('/news');
    news.views++;
    await news.save();
    const related = await News.find({ category: news.category, status: 'published', _id: { $ne: news._id } }).limit(3);
    const lang = res.locals.lang;
    res.render('public/news-detail', {
      layout: 'layouts/public',
      title: news['title_' + lang] || news.title_uz,
      news, related
    });
  } catch(err) {
    res.redirect('/news');
  }
};
