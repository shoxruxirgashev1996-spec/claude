const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI topilmadi!');
    console.error('   Render Dashboard → Environment → MONGODB_URI qo\'shing');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB ulandi: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('❌ MongoDB ulanmadi:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
