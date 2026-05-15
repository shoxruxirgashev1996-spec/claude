require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('❌ MONGODB_URI yoq!'); process.exit(1); }

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ MongoDB ulandi!');

    // User modelini yuklaymiz
    const User = require('../models/User');

    // Barcha userlarni ko'rsatamiz
    const all = await User.find({});
    console.log('📊 Mavjud userlar:', all.length);
    all.forEach(u => console.log('  -', u.email, u.role, 'active:', u.isActive));

    // Eskisini o'chiramiz
    await User.deleteMany({ email: 'superadmin@school.uz' });
    console.log('🗑️  Eski admin ochirildi');

    // Yangi user - pre('save') hook parolni hash qiladi
    const admin = new User({
      name: 'Super Admin',
      email: 'superadmin@school.uz',
      password: 'admin123',
      role: 'superadmin',
      isActive: true
    });
    await admin.save();
    console.log('✅ Admin yaratildi! ID:', admin._id);

    // Tekshiramiz
    const bcrypt = require('bcryptjs');
    const saved = await User.findOne({ email: 'superadmin@school.uz' });
    console.log('📧 Email:', saved.email);
    console.log('👤 Role:', saved.role);
    console.log('✅ isActive:', saved.isActive);
    console.log('🔑 Password hash:', saved.password.substring(0, 20) + '...');
    
    const check = await bcrypt.compare('admin123', saved.password);
    console.log('✅ Parol tekshiruvi:', check ? 'TOGRI ✅' : 'XATO ❌');

    await mongoose.disconnect();
    console.log('\n🎉 Admin tayyor!');
    console.log('   Email: superadmin@school.uz');
    console.log('   Parol: admin123');
    process.exit(0);
  } catch(err) {
    console.error('❌ Xato:', err.message);
    process.exit(1);
  }
}

createAdmin();
