require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.log('⚠️  MONGODB_URI yoq - ensure-admin skip');
  process.exit(0);
}

async function ensureAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    const db = mongoose.connection.db;

    // ── Admin user ──
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
      console.log('✅ Super Admin yaratildi');
    }

    // ── Default Settings ──
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
      { key: 'footer_address_uz', value: "Toshkent shahri, Yunusobod tumani" },
    ];
    for (const s of defaults) {
      await settings.updateOne({ key: s.key }, { $setOnInsert: { ...s } }, { upsert: true });
    }

    // ── Stats ──
    const statsCol = db.collection('stats');
    const statsCount = await statsCol.countDocuments();
    if (statsCount === 0) {
      await statsCol.insertOne({
        students_count: 1200,
        teachers_count: 85,
        awards_count: 340,
        graduates_count: 3500,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Stats yaratildi');
    }

    // ── Sample Announcement ──
    const ann = db.collection('announcements');
    const annCount = await ann.countDocuments();
    if (annCount === 0) {
      await ann.insertOne({
        title_uz: "2025-2026 o'quv yili uchun qabul boshlandi!",
        title_ru: "Открыт приём на 2025-2026 учебный год!",
        title_en: "Admission for 2025-2026 academic year is open!",
        content_uz: "Ariza topshirish muddati: 1-may — 30-iyun",
        content_ru: "Срок подачи заявок: 1 мая — 30 июня",
        content_en: "Application deadline: May 1 — June 30",
        isActive: true,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Namuna e\'lon yaratildi');
    }

    await mongoose.disconnect();
    console.log('✅ ensure-admin tugadi');
    process.exit(0);
  } catch(err) {
    console.error('⚠️  ensure-admin:', err.message);
    process.exit(0);
  }
}

ensureAdmin();
