require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/database');
const { injectGlobals, setLanguage } = require('./middleware');

const app = express();

// ── Uploads papkalarini avtomatik yaratish (Render uchun muhim) ──────────────
const uploadDirs = ['news', 'gallery', 'logos', 'banners', 'directors'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, 'public', 'uploads', dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// ── Database ─────────────────────────────────────────────────────────────────
connectDB();

// ── View Engine ───────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/public');
// express-ejs-layouts: script va style taglarini layout ichiga chiqarish
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// ── Body Parser & Override ────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(methodOverride('_method'));

// ── Static Files ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Session ───────────────────────────────────────────────────────────────────
// Render'da MONGODB_URI environment variable bo'lishi SHART
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'school-cms-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 kun
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' // Render HTTPS ishlatadi
  }
};

// MongoDB session store (ulanish bo'lsa)
if (process.env.MONGODB_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600,
    ttl: 7 * 24 * 60 * 60
  });
}

app.use(session(sessionConfig));

// ── Flash Messages ─────────────────────────────────────────────────────────────
app.use(flash());

// ── Language & Globals ─────────────────────────────────────────────────────────
app.use(setLanguage);
app.use(injectGlobals);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/public'));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  try {
    res.status(404).render('public/404', {
      layout: 'layouts/public',
      title: '404 - Sahifa topilmadi'
    });
  } catch (e) {
    res.status(404).send('<h1>404 - Sahifa topilmadi</h1><a href="/">Bosh sahifaga qaytish</a>');
  }
});

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server xatosi:', err.stack);
  const isDev = process.env.NODE_ENV !== 'production';
  try {
    res.status(500).render('public/500', {
      layout: 'layouts/public',
      title: 'Server xatosi',
      error: isDev ? err.message : 'Ichki server xatosi yuz berdi'
    });
  } catch (renderErr) {
    res.status(500).send(`
      <h1>500 - Server Xatosi</h1>
      <p>${isDev ? err.message : 'Ichki server xatosi'}</p>
      <a href="/">Bosh sahifaga qaytish</a>
    `);
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`📊 Admin Panel:  http://localhost:${PORT}/admin/login`);
  console.log(`🌐 Public Site:  http://localhost:${PORT}`);
  console.log(`🌍 Muhit: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n🔐 Admin:');
  console.log('   Email:    superadmin@school.uz');
  console.log('   Parol:    admin123\n');
});
