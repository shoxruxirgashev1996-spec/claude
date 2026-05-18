const { Staff } = require('../models');
const path = require('path');
const fs = require('fs');

// Admin - list
exports.index = async (req, res) => {
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  const staff = await Staff.find(filter).sort({ type: 1, order: 1, full_name: 1 });
  res.render('admin/staff/index', {
    layout: 'layouts/admin', title: "Xodimlar boshqaruvi", staff, query: req.query
  });
};

// Admin - create form
exports.getCreate = (req, res) => {
  res.render('admin/staff/form', {
    layout: 'layouts/admin', title: "Xodim qo'shish", staff: null
  });
};

// Admin - save
exports.postCreate = async (req, res) => {
  try {
    const data = {
      full_name: req.body.full_name,
      position_uz: req.body.position_uz || '',
      position_ru: req.body.position_ru || req.body.position_uz || '',
      position_en: req.body.position_en || req.body.position_uz || '',
      department_uz: req.body.department_uz || '',
      department_ru: req.body.department_ru || req.body.department_uz || '',
      department_en: req.body.department_en || req.body.department_uz || '',
      bio_uz: req.body.bio_uz || '',
      bio_ru: req.body.bio_ru || '',
      bio_en: req.body.bio_en || '',
      phone: req.body.phone || '',
      email: req.body.email || '',
      education: req.body.education || '',
      experience: req.body.experience || '',
      type: req.body.type || 'xodim',
      order: parseInt(req.body.order) || 0,
      isActive: req.body.isActive === 'true'
    };
    if (req.file) data.image = '/uploads/staff/' + req.file.filename;
    if (!data.full_name) throw new Error('Ism-familiya kiritish shart!');
    await Staff.create(data);
    req.flash('success', "Xodim muvaffaqiyatli qo'shildi!");
    res.redirect('/admin/staff');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin/staff/create');
  }
};

// Admin - edit form
exports.getEdit = async (req, res) => {
  const staff = await Staff.findById(req.params.id);
  if (!staff) { req.flash('error', 'Topilmadi'); return res.redirect('/admin/staff'); }
  res.render('admin/staff/form', {
    layout: 'layouts/admin', title: "Xodimni tahrirlash", staff
  });
};

// Admin - update
exports.postEdit = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) { req.flash('error', 'Topilmadi'); return res.redirect('/admin/staff'); }
    staff.full_name = req.body.full_name || staff.full_name;
    staff.position_uz = req.body.position_uz || '';
    staff.position_ru = req.body.position_ru || req.body.position_uz || '';
    staff.position_en = req.body.position_en || req.body.position_uz || '';
    staff.department_uz = req.body.department_uz || '';
    staff.department_ru = req.body.department_ru || req.body.department_uz || '';
    staff.department_en = req.body.department_en || req.body.department_uz || '';
    staff.bio_uz = req.body.bio_uz || '';
    staff.bio_ru = req.body.bio_ru || '';
    staff.bio_en = req.body.bio_en || '';
    staff.phone = req.body.phone || '';
    staff.email = req.body.email || '';
    staff.education = req.body.education || '';
    staff.experience = req.body.experience || '';
    staff.type = req.body.type || staff.type;
    staff.order = parseInt(req.body.order) || 0;
    staff.isActive = req.body.isActive === 'true';
    if (req.file) {
      if (staff.image) {
        const old = path.join(__dirname, '../public', staff.image);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      staff.image = '/uploads/staff/' + req.file.filename;
    }
    await staff.save();
    req.flash('success', 'Xodim yangilandi!');
    res.redirect('/admin/staff');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect(`/admin/staff/${req.params.id}/edit`);
  }
};

// Admin - delete
exports.delete = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (staff) {
      if (staff.image) {
        const f = path.join(__dirname, '../public', staff.image);
        if (fs.existsSync(f)) fs.unlinkSync(f);
      }
      await staff.deleteOne();
    }
    req.flash('success', "O'chirildi");
  } catch (err) {
    req.flash('error', err.message);
  }
  res.redirect('/admin/staff');
};

// Public - about page
exports.publicAbout = async (req, res) => {
  const { About, Stats } = require('../models');
  const [about, stats, rahbariyat, oqituvchilar, xodimlar] = await Promise.all([
    About.findOne() || {},
    Stats.findOne() || {},
    Staff.find({ type: 'rahbariyat', isActive: true }).sort({ order: 1 }),
    Staff.find({ type: 'oqituvchi', isActive: true }).sort({ order: 1 }),
    Staff.find({ type: 'xodim', isActive: true }).sort({ order: 1 })
  ]);
  const lang = res.locals.lang;
  res.render('public/about', {
    layout: 'layouts/public',
    title: lang==='uz' ? 'Maktab haqida' : lang==='ru' ? 'О школе' : 'About School',
    about: about || {},
    stats: stats || {},
    rahbariyat, oqituvchilar, xodimlar
  });
};
