require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Shoxrux19960219:Shoxrux19960219@cluster0.jenomkb.mongodb.net/school_cms?retryWrites=true&w=majority&appName=Cluster0';

async function createAdmin() {
  try {
    console.log('MongoDB ga ulanmoqda...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ Ulandi!');

    // User modelini to'g'ridan-to'g'ri schema bilan yaratamiz
    const bcrypt = require('bcryptjs');
    
    const userSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: String,
      isActive: { type: Boolean, default: true },
      lastLogin: Date
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Avval o'chir
    await User.deleteMany({ email: 'superadmin@school.uz' });
    console.log('Eski admin o\'chirildi');

    // Yangi hash
    const password = await bcrypt.hash('admin123', 12);
    
    // Yangi admin yaratish
    const admin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@school.uz',
      password: password,
      role: 'superadmin',
      isActive: true
    });

    console.log('✅ Admin yaratildi!');
    console.log('   ID:', admin._id);
    console.log('   Email: superadmin@school.uz');
    console.log('   Parol: admin123');
    console.log('   Role:', admin.role);

    // Tekshiramiz
    const found = await User.findOne({ email: 'superadmin@school.uz' });
    const isMatch = await bcrypt.compare('admin123', found.password);
    console.log('✅ Parol tekshiruvi:', isMatch ? 'TO\'G\'RI' : 'XATO');

    await mongoose.disconnect();
    process.exit(0);
  } catch(err) {
    console.error('❌ Xato:', err.message);
    process.exit(1);
  }
}

createAdmin();
