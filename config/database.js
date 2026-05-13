const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI topilmadi!');
    console.error('   Render Dashboard → Environment Variables → Add:');
    console.error('   MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/school_cms');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB ulandi: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB ulanish xatosi:', error.message);
    console.error('   Tekshiring:');
    console.error('   1. MONGODB_URI togri kiritilganmi?');
    console.error('   2. MongoDB Atlas → Network Access → 0.0.0.0/0 qoshilganmi?');
    console.error('   3. Atlas username/password togri?');
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB uzildi'));
  mongoose.connection.on('error', err => console.error('❌ MongoDB xatosi:', err.message));
};

module.exports = connectDB;
