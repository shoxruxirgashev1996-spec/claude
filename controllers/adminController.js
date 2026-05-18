const { Contact, Application, Gallery, Budget, Announcement, Settings, About, Stats } = require('../models');
const path = require('path');
const fs = require('fs');

// ── CONTACTS ──────────────────────────────────────────────────────────────────
exports.getContacts = async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.render('admin/contacts/index', { layout: 'layouts/admin', title: 'Messages', contacts });
};
exports.markRead = async (req, res) => {
  await Contact.findByIdAndUpdate(req.params.id, { isRead: true });
  res.redirect('/admin/contacts');
};
exports.deleteContact = async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  req.flash('success', "O'chirildi");
  res.redirect('/admin/contacts');
};

// ── APPLICATIONS ──────────────────────────────────────────────────────────────
exports.getApplications = async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  const apps = await Application.find(query).sort({ createdAt: -1 });
  res.render('admin/applications/index', { layout: 'layouts/admin', title: 'Applications', apps, query: req.query });
};
exports.updateAppStatus = async (req, res) => {
  await Application.findByIdAndUpdate(req.params.id, { status: req.body.status, notes: req.body.notes || '' });
  req.flash('success', 'Status yangilandi');
  res.redirect('/admin/applications');
};
exports.deleteApp = async (req, res) => {
  await Application.findByIdAndDelete(req.params.id);
  req.flash('success', "O'chirildi");
  res.redirect('/admin/applications');
};

// ── GALLERY ───────────────────────────────────────────────────────────────────
exports.getGallery = async (req, res) => {
  const gallery = await Gallery.find().sort({ createdAt: -1 });
  const categories = await Gallery.distinct('category');
  res.render('admin/gallery/index', { layout: 'layouts/admin', title: 'Gallery', gallery, categories });
};
exports.uploadGallery = async (req, res) => {
  try {
    const data = {
      title_uz: req.body.title_uz || '',
      title_ru: req.body.title_ru || '',
      title_en: req.body.title_en || '',
      category: req.body.category || 'general',
      type: 'image'
    };
    if (req.file) {
      data.image = '/uploads/gallery/' + req.file.filename;
      data.type = 'image';
    } else if (req.body.video_url) {
      data.video_url = req.body.video_url;
      data.type = 'video';
    } else {
      throw new Error('Rasm yoki video URL kerak');
    }
    await Gallery.create(data);
    req.flash('success', "Qo'shildi");
  } catch(err) {
    req.flash('error', err.message);
  }
  res.redirect('/admin/gallery');
};
exports.deleteGallery = async (req, res) => {
  const item = await Gallery.findById(req.params.id);
  if (item) {
    if (item.image) { const f = path.join(__dirname, '../public', item.image); if(fs.existsSync(f)) fs.unlinkSync(f); }
    await item.deleteOne();
  }
  req.flash('success', "O'chirildi");
  res.redirect('/admin/gallery');
};

// ── BUDGET ────────────────────────────────────────────────────────────────────
exports.getBudget = async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const query = { year };
  if (req.query.type) query.type = req.query.type;
  const [budgets, years] = await Promise.all([
    Budget.find(query).sort({ date: -1 }),
    Budget.distinct('year')
  ]);
  const income = budgets.filter(b=>b.type==='income').reduce((s,b)=>s+b.amount,0);
  const expense = budgets.filter(b=>b.type==='expense').reduce((s,b)=>s+b.amount,0);
  const monthly = await Budget.aggregate([
    { $match: { year } },
    { $group: { _id: { month: '$month', type: '$type' }, total: { $sum: '$amount' } } },
    { $sort: { '_id.month': 1 } }
  ]);
  res.render('admin/budget/index', { layout:'layouts/admin', title:'Budget', budgets, income, expense, year, years, monthly, query: req.query });
};
exports.createBudget = async (req, res) => {
  try {
    await Budget.create({
      type: req.body.type, amount: parseFloat(req.body.amount),
      category_uz: req.body.category_uz || '',
      category_ru: req.body.category_ru || '',
      category_en: req.body.category_en || '',
      description_uz: req.body.description_uz || '',
      description_ru: req.body.description_ru || '',
      description_en: req.body.description_en || '',
      date: req.body.date || Date.now()
    });
    req.flash('success', "Qo'shildi");
  } catch(err) { req.flash('error', err.message); }
  res.redirect('/admin/budget');
};
exports.deleteBudget = async (req, res) => {
  await Budget.findByIdAndDelete(req.params.id);
  req.flash('success', "O'chirildi");
  res.redirect('/admin/budget');
};

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
exports.getAnnouncements = async (req, res) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 });
  res.render('admin/announcements/index', { layout:'layouts/admin', title:'Announcements', announcements });
};
exports.createAnnouncement = async (req, res) => {
  try {
    await Announcement.create({
      title_uz: req.body.title_uz, title_ru: req.body.title_ru || req.body.title_uz, title_en: req.body.title_en || req.body.title_uz,
      content_uz: req.body.content_uz || '', content_ru: req.body.content_ru || '', content_en: req.body.content_en || '',
      isActive: req.body.isActive === 'true',
      expiresAt: req.body.expiresAt || null
    });
    req.flash('success', "Qo'shildi");
  } catch(err) { req.flash('error', err.message); }
  res.redirect('/admin/announcements');
};
exports.toggleAnnouncement = async (req, res) => {
  const a = await Announcement.findById(req.params.id);
  if (a) { a.isActive = !a.isActive; await a.save(); }
  res.redirect('/admin/announcements');
};
exports.deleteAnnouncement = async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  req.flash('success', "O'chirildi");
  res.redirect('/admin/announcements');
};

// ── SETTINGS ──────────────────────────────────────────────────────────────────
exports.getSettings = async (req, res) => {
  const settingsDocs = await Settings.find({});
  const settings = {};
  settingsDocs.forEach(s => { settings[s.key] = s.value; });
  const stats = await Stats.findOne() || {};
  res.render('admin/settings/index', { layout:'layouts/admin', title:'Settings', settings, stats });
};

exports.saveSettings = async (req, res) => {
  try {
    const keys = [
      'site_name_uz','site_name_ru','site_name_en',
      'primary_color','secondary_color',
      'bg_type','bg_color',
      'banner_title_uz','banner_title_ru','banner_title_en',
      'banner_subtitle_uz','banner_subtitle_ru','banner_subtitle_en',
      'hero_video_url',
      'footer_phone','footer_email','footer_address_uz',
      'social_telegram','social_instagram','social_youtube','social_facebook',
      'meta_title_uz','meta_desc_uz','favicon_url'
    ];
    for (const key of keys) {
      if (req.body[key] !== undefined) {
        await Settings.findOneAndUpdate({ key }, { value: req.body[key] }, { upsert: true });
      }
    }
    // File uploads
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        await Settings.findOneAndUpdate({ key:'logo' }, { value:'/uploads/logos/'+req.files.logo[0].filename }, { upsert:true });
      }
      if (req.files.banner_image && req.files.banner_image[0]) {
        await Settings.findOneAndUpdate({ key:'banner_image' }, { value:'/uploads/banners/'+req.files.banner_image[0].filename }, { upsert:true });
      }
      if (req.files.bg_image && req.files.bg_image[0]) {
        await Settings.findOneAndUpdate({ key:'bg_image' }, { value:'/uploads/banners/'+req.files.bg_image[0].filename }, { upsert:true });
      }
    }
    req.flash('success', 'Sozlamalar saqlandi!');
  } catch(err) {
    req.flash('error', err.message);
  }
  res.redirect('/admin/settings');
};

exports.saveStats = async (req, res) => {
  try {
    await Stats.findOneAndUpdate({}, {
      students_count: parseInt(req.body.students_count) || 0,
      teachers_count: parseInt(req.body.teachers_count) || 0,
      awards_count: parseInt(req.body.awards_count) || 0,
      graduates_count: parseInt(req.body.graduates_count) || 0
    }, { upsert: true });
    req.flash('success', 'Statistika saqlandi!');
  } catch(err) { req.flash('error', err.message); }
  res.redirect('/admin/settings');
};

// ── ABOUT ─────────────────────────────────────────────────────────────────────
exports.getAbout = async (req, res) => {
  const about = await About.findOne() || {};
  res.render('admin/about/index', { layout:'layouts/admin', title:'About Page', about });
};
exports.saveAbout = async (req, res) => {
  try {
    await About.findOneAndUpdate({}, {
      mission_uz: req.body.mission_uz || '', mission_ru: req.body.mission_ru || '', mission_en: req.body.mission_en || '',
      vision_uz: req.body.vision_uz || '', vision_ru: req.body.vision_ru || '', vision_en: req.body.vision_en || '',
      history_uz: req.body.history_uz || '', history_ru: req.body.history_ru || '', history_en: req.body.history_en || ''
    }, { upsert: true });
    req.flash('success', 'Saqlandi!');
  } catch(err) { req.flash('error', err.message); }
  res.redirect('/admin/about');
};
exports.addDirector = async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) about = new About();
    const dir = {
      name: req.body.name,
      position_uz: req.body.position_uz || '',
      position_ru: req.body.position_ru || '',
      position_en: req.body.position_en || '',
      order: parseInt(req.body.order) || 0
    };
    if (req.file) dir.image = '/uploads/directors/' + req.file.filename;
    if (!about.directors) about.directors = [];
    about.directors.push(dir);
    about.directors.sort((a,b) => a.order - b.order);
    await about.save();
    req.flash('success', "Qo'shildi");
  } catch(err) { req.flash('error', err.message); }
  res.redirect('/admin/about');
};
exports.deleteDirector = async (req, res) => {
  const about = await About.findOne();
  if (about) {
    about.directors = about.directors.filter(d => d._id.toString() !== req.params.id);
    await about.save();
  }
  req.flash('success', "O'chirildi");
  res.redirect('/admin/about');
};
