const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/admin/dashboard');
  const error = req.query.error || null;
  res.render('admin/login', { layout: false, title: 'Admin Login', error });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('LOGIN:', email);

    if (!email || !password) {
      return res.redirect('/admin/login?error=' + encodeURIComponent('Email va parol kiritish shart'));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.log('USER TOPILMADI:', email);
      return res.redirect('/admin/login?error=' + encodeURIComponent('Email yoki parol notogri'));
    }

    console.log('USER TOPILDI:', user.email, '| isActive:', user.isActive);

    if (!user.isActive) {
      return res.redirect('/admin/login?error=' + encodeURIComponent('Akkaunt faol emas'));
    }

    // Parolni tekshirish
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('PAROL:', isMatch ? 'TOGRI' : 'NOTOGRI');

    if (!isMatch) {
      return res.redirect('/admin/login?error=' + encodeURIComponent('Email yoki parol notogri'));
    }

    // Session saqlash
    req.session.userId = user._id.toString();
    req.session.userName = user.name;
    req.session.role = user.role;

    req.session.save((err) => {
      if (err) {
        console.error('SESSION XATO:', err);
        return res.redirect('/admin/login?error=' + encodeURIComponent('Session xatosi'));
      }
      console.log('LOGIN OK ->', user.email);
      res.redirect('/admin/dashboard');
    });

  } catch (err) {
    console.error('LOGIN XATO:', err.message);
    res.redirect('/admin/login?error=' + encodeURIComponent('Xato: ' + err.message));
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
};
