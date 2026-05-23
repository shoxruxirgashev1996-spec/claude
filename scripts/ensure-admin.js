require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.log('⚠️  MONGODB_URI yoq - ensure-admin skip');
  process.exit(0); // exit 0 - serverni to'xtatmasin
}

async function ensureAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    
    const db = mongoose.connection.db;
    const users = db.collection('users');
    const count = await users.countDocuments({ email: 'superadmin@school.uz' });
    
    if (count === 0) {
      const hash = await bcrypt.hash('admin123', 12);
      await users.insertOne({
        name: 'Super Admin',
        email: 'superadmin@school.uz',
        password: hash,
        role: 'superadmin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Super Admin yaratildi: superadmin@school.uz / admin123');
    } else {
      console.log('ℹ️  Super Admin allaqachon mavjud');
    }
    
    // Default settings
    const settings = db.collection('settings');
    const defaults = [
      { key: 'site_name_uz', value: 'Prezident Maktabi' },
      { key: 'site_name_ru', value: 'Президентская Школа' },
      { key: 'site_name_en', value: 'Presidential School' },
      { key: 'primary_color', value: '#0f2a5e' },
      { key: 'secondary_color', value: '#d4a017' },
      { key: 'bg_type', value: 'color' },
      { key: 'banner_title_uz', value: "Bilimli avlod — kelajak poydevori" },
      { key: 'banner_title_ru', value: "Знающее поколение — основа будущего" },
      { key: 'banner_title_en', value: "Educated Generation — Foundation of the Future" },
      { key: 'banner_subtitle_uz', value: "Zamonaviy ta'lim, ilm va innovatsiya markazi" },
      { key: 'banner_subtitle_ru', value: "Центр современного образования, науки и инноваций" },
      { key: 'banner_subtitle_en', value: "Center of modern education, science and innovation" },
      { key: 'footer_phone', value: '+998 71 200 00 00' },
      { key: 'footer_email', value: 'info@school.uz' },
    ];
    for (const s of defaults) {
      await settings.updateOne({ key: s.key }, { $setOnInsert: s }, { upsert: true });
    }
    console.log('✅ Sozlamalar tayyor');
    
    await mongoose.disconnect();
    console.log('✅ ensure-admin tugadi');
    process.exit(0);
  } catch(err) {
    console.error('⚠️  ensure-admin xatosi:', err.message);
    process.exit(0); // exit 0 - serverni to'xtatmasin!
  }
}

ensureAdmin();
