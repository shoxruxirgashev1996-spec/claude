const User = require('../models/User');

exports.getLogin = (req, res) => {
  if (req.session.userId) return res.redirect('/admin/dashboard');
  res.render('admin/login', { layout: false, title: 'Admin Login' });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      req.flash('error', 'Email and password required');
      return res.redirect('/admin/login');
    }
    const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/admin/login');
    }
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.role = user.role;
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    res.redirect('/admin/dashboard');
  } catch (err) {
    req.flash('error', 'Login failed');
    res.redirect('/admin/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
};
