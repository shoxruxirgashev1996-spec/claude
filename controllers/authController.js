const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

exports.getLogin = (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/admin/dashboard');
  const error = req.query.error || null;
  res.render('admin/login', { layout: false, title: 'Admin Login', error });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('🔐 Login:', email);

    if (!email || !password) {
      return res.redirect('/admin/login?error=' + encodeURIComponent('Email va parol kiritish shart'));
    }

    // To'g'ridan MongoDB collection ishlatamiz
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({ 
      email: email.toLowerCase().trim() 
    });

    console.log('👤 User:', user ? user.email : 'TOPILMADI');

    if (!user) {
      return res.redirect('/admin/login?error=' + encodeURIComponent('Email yoki parol notogri'));
    }

    if (!user.isActive) {
      return res.redirect('/admin/login?error=' + encodeURIComponent('Akkaunt faol emas'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Parol:', isMatch ? 'TOGRI' : 'NOTOGRI');

    if (!isMatch) {
      return res.redirect('/admin/login?error=' + encodeURIComponent('Email yoki parol notogri'));
    }

    req.session.userId = user._id.toString();
    req.session.userName = user.name;
    req.session.role = user.role;

    req.session.save((err) => {
      if (err) {
        console.error('Session xato:', err);
        return res.redirect('/admin/login?error=' + encodeURIComponent('Session xatosi'));
      }
      console.log('✅ Login OK:', user.email);
      res.redirect('/admin/dashboard');
    });

  } catch (err) {
    console.error('❌ Xato:', err.message);
    res.redirect('/admin/login?error=' + encodeURIComponent('Xato: ' + err.message));
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
};
