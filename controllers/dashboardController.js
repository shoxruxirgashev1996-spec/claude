const News = require('../models/News');
const { Contact, Application, Gallery, Budget, Announcement } = require('../models');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalNews, totalApplications, totalContacts, totalGallery,
      pendingApps, unreadContacts, recentNews, recentApps,
      budgetData, monthlyApps
    ] = await Promise.all([
      News.countDocuments(),
      Application.countDocuments(),
      Contact.countDocuments(),
      Gallery.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Contact.countDocuments({ isRead: false }),
      News.find().sort({ createdAt: -1 }).limit(5).populate('author', 'name'),
      Application.find().sort({ createdAt: -1 }).limit(5),
      Budget.aggregate([
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      Application.aggregate([
        {
          $group: {
            _id: { year: '$year', month: { $month: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ])
    ]);

    const income = budgetData.find(b => b._id === 'income')?.total || 0;
    const expense = budgetData.find(b => b._id === 'expense')?.total || 0;

    // Monthly news stats for chart
    const monthlyNews = await News.aggregate([
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.render('admin/dashboard', {
      layout: 'layouts/admin',
      title: 'Dashboard',
      stats: { totalNews, totalApplications, totalContacts, totalGallery, pendingApps, unreadContacts, income, expense },
      recentNews, recentApps, monthlyNews, monthlyApps
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Dashboard error');
    res.redirect('/admin/login');
  }
};
