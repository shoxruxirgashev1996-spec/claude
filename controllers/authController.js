const User = require('../models/User');

exports.getLogin = (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/admin/dashboard');
  res.render('admin/login', { layout: false, title: 'Admin Login' });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login urinish:', email);
    
    if (!email || !password) {
      req.flash('error', 'Email va parol kiritish shart');
      return res.redirect('/admin/login');
    }

    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      isActive: true 
    });
    
    console.log('👤 User topildi:', user ? 'HA' : 'YOQ');
    
    if (!user) {
      req.flash('error', 'Email yoki parol noto\'g\'ri');
      return res.redirect('/admin/login');
    }

    const isMatch = await user.comparePassword(password);
    console.log('🔑 Parol to\'g\'ri:', isMatch ? 'HA' : 'YOQ');
    
    if (!isMatch) {
      req.flash('error', 'Email yoki parol noto\'g\'ri');
      return res.redirect('/admin/login');
    }

    req.session.userId = user._id.toString();
    req.session.userName = user.name;
    req.session.role = user.role;
    
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    
    console.log('✅ Login muvaffaqiyatli:', user.email, '| Role:', user.role);
    
    req.session.save((err) => {
      if (err) {
        console.error('Session save xatosi:', err);
        req.flash('error', 'Session xatosi');
        return res.redirect('/admin/login');
      }
      res.redirect('/admin/dashboard');
    });

  } catch (err) {
    console.error('❌ Login xatosi:', err.message);
    req.flash('error', 'Tizimda xato yuz berdi: ' + err.message);
    res.redirect('/admin/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
};
