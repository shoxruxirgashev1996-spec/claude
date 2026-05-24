const News = require('../models/News');
const { Contact, Application, Gallery, Budget, Announcement, About, Stats } = require('../models');

exports.home = async (req, res) => {
  try {
    const [latestNews, announcements, stats, gallery] = await Promise.all([
      News.find({ status: 'published' }).sort({ createdAt: -1 }).limit(6),
      Announcement.find({
        isActive: true,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }]
      }).sort({ createdAt: -1 }).limit(5),
      Stats.findOne(),
      Gallery.find({ isActive: true }).sort({ createdAt: -1 }).limit(8)
    ]);
    res.render('public/home', {
      layout: 'layouts/public',
      title: 'Bosh sahifa',
      latestNews,
      announcements,
      stats: stats || { students_count: 0, teachers_count: 0, awards_count: 0, graduates_count: 0 },
      gallery
    });
  } catch(err) {
    console.error('Home error:', err.message);
    res.render('public/home', {
      layout: 'layouts/public',
      title: 'Bosh sahifa',
      latestNews: [], announcements: [],
      stats: {}, gallery: []
    });
  }
};

exports.about = async (req, res) => {
  try {
    const about = await About.findOne() || {};
    res.render('public/about', {
      layout: 'layouts/public',
      title: res.locals.lang === 'uz' ? 'Maktab haqida' : res.locals.lang === 'ru' ? 'О школе' : 'About School',
      about
    });
  } catch(err) {
    res.redirect('/');
  }
};

exports.admission = (req, res) => {
  res.render('public/admission', {
    layout: 'layouts/public',
    title: res.locals.lang === 'uz' ? 'Qabul' : res.locals.lang === 'ru' ? 'Приём' : 'Admission'
  });
};

exports.applyPost = async (req, res) => {
  try {
    const { first_name, last_name, phone, birth_date } = req.body;
    if (!first_name || !last_name || !phone || !birth_date) throw new Error('Barcha maydonlar to\'ldirilishi shart');
    await Application.create({ first_name, last_name, phone, birth_date: new Date(birth_date) });
    req.flash('success', 'Arizangiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog\'lanamiz.');
  } catch(err) {
    req.flash('error', err.message);
  }
  res.redirect('/admission');
};

exports.gallery = async (req, res) => {
  try {
    const category = req.query.category;
    const query = { isActive: true };
    if (category) query.category = category;
    const [gallery, categories] = await Promise.all([
      Gallery.find(query).sort({ createdAt: -1 }),
      Gallery.distinct('category')
    ]);
    res.render('public/gallery', {
      layout: 'layouts/public',
      title: res.locals.lang === 'uz' ? 'Galereya' : res.locals.lang === 'ru' ? 'Галерея' : 'Gallery',
      gallery, categories, query: req.query
    });
  } catch(err) {
    res.redirect('/');
  }
};

exports.contact = (req, res) => {
  res.render('public/contact', {
    layout: 'layouts/public',
    title: res.locals.lang === 'uz' ? 'Aloqa' : res.locals.lang === 'ru' ? 'Контакт' : 'Contact'
  });
};

exports.contactPost = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) throw new Error('Barcha maydonlar to\'ldirilishi shart');
    await Contact.create({ name, email, message });
    req.flash('success', 'Xabaringiz yuborildi! Tez orada javob beramiz.');
  } catch(err) {
    req.flash('error', err.message);
  }
  res.redirect('/contact');
};

exports.budget = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const [budgets, years] = await Promise.all([
      Budget.find({ year }).sort({ date: -1 }),
      Budget.distinct('year')
    ]);
    const income = budgets.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0);
    const expense = budgets.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0);
    const monthly = await Budget.aggregate([
      { $match: { year } },
      { $group: { _id: { month: '$month', type: '$type' }, total: { $sum: '$amount' } } },
      { $sort: { '_id.month': 1 } }
    ]);
    res.render('public/budget', {
      layout: 'layouts/public',
      title: res.locals.lang === 'uz' ? 'Budjet shaffofligi' : res.locals.lang === 'ru' ? 'Прозрачность бюджета' : 'Budget Transparency',
      budgets, income, expense, year,
      years: years.length ? years : [new Date().getFullYear()],
      monthly
    });
  } catch(err) {
    res.redirect('/');
  }
};
