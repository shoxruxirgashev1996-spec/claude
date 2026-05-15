const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.getLogin = (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/admin/dashboard');
  const error = req.query.error || null;
  res.render('admin/login', { layout: false, title: 'Admin Login', error });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('🔐 Login urinish:', email);

    if (!email || !password) {
      return res.redirect('/admin/login?error=' + encodeURIComponent('Email va parol kiritish shart'));
    }

    // User modelini ishlatamiz
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    console.log('👤 User topildi:', user ? 'HA - ' + user.email : 'YOQ');

    if (!user) {
      return res.redirect('/admin/login?error=' + encodeURIComponent('Email topilmadi'));
    }

    console.log('🔒 isActive:', user.isActive);
    console.log('🔒 role:', user.role);
    console.log('🔒 password hash bor:', !!user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Parol togri:', isMatch ? 'HA' : 'YOQ');

    if (!isMatch) {
      return res.redirect('/admin/login?error=' + encodeURIComponent('Parol notogri'));
    }

    req.session.userId = user._id.toString();
    req.session.userName = user.name;
    req.session.role = user.role;

    req.session.save((err) => {
      if (err) {
        console.error('❌ Session xato:', err);
        return res.redirect('/admin/login?error=' + encodeURIComponent('Session xatosi: ' + err.message));
      }
      console.log('✅ Login muvaffaqiyatli!');
      res.redirect('/admin/dashboard');
    });

  } catch (err) {
    console.error('❌ Login xato:', err.message);
    res.redirect('/admin/login?error=' + encodeURIComponent(err.message));
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
};
