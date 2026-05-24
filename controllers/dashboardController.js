const News = require('../models/News');
const { Contact, Application, Gallery, Budget, Announcement, Stats } = require('../models');

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalNews, totalApplications, totalContacts, totalGallery,
      pendingApps, unreadContacts, recentNews, recentApps,
      budgetData, monthlyApps, stats
    ] = await Promise.all([
      News.countDocuments(),
      Application.countDocuments(),
      Contact.countDocuments(),
      Gallery.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Contact.countDocuments({ isRead: false }),
      News.find().sort({ createdAt: -1 }).limit(5).populate('author', 'name'),
      Application.find().sort({ createdAt: -1 }).limit(5),
      Budget.aggregate([{ $group: { _id: '$type', total: { $sum: '$amount' } } }]),
      Application.aggregate([
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ]),
      Stats.findOne()
    ]);

    const income = budgetData.find(b => b._id === 'income')?.total || 0;
    const expense = budgetData.find(b => b._id === 'expense')?.total || 0;

    const monthlyNews = await News.aggregate([
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.render('admin/dashboard', {
      layout: 'layouts/admin',
      title: 'Dashboard',
      stats: { totalNews, totalApplications, totalContacts, totalGallery, pendingApps, unreadContacts, income, expense },
      siteStats: stats || {},
      recentNews, recentApps, monthlyNews, monthlyApps
    });
  } catch(err) {
    console.error('Dashboard error:', err.message);
    req.flash('error', 'Dashboard yuklanmadi: ' + err.message);
    res.redirect('/admin/login');
  }
};
