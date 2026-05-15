require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI yoq!');
  process.exit(1);
}

async function createAdmin() {
  try {
    console.log('🔗 MongoDB ga ulanmoqda...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ MongoDB ulandi!');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Barcha userlarni ko'rsatamiz
    const allUsers = await usersCollection.find({}).toArray();
    console.log('📊 Jami userlar:', allUsers.length);
    allUsers.forEach(u => console.log('  -', u.email, '|', u.role));

    // Eskisini o'chiramiz
    await usersCollection.deleteMany({ email: 'superadmin@school.uz' });
    console.log('🗑️  Eski admin ochirildi');

    // Yangi hash yaratamiz
    const hash = await bcrypt.hash('admin123', 12);
    console.log('🔑 Hash yaratildi');

    // To'g'ridan-to'g'ri collection ga kiritamiz
    const result = await usersCollection.insertOne({
      name: 'Super Admin',
      email: 'superadmin@school.uz',
      password: hash,
      role: 'superadmin',
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Admin yaratildi! ID:', result.insertedId);

    // Tekshiramiz
    const saved = await usersCollection.findOne({ email: 'superadmin@school.uz' });
    const check = await bcrypt.compare('admin123', saved.password);
    console.log('✅ Parol tekshiruvi:', check ? 'TOGRI ✅' : 'XATO ❌');
    console.log('✅ isActive:', saved.isActive);
    console.log('✅ role:', saved.role);

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
