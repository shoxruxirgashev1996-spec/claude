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

// ── Uploads papkalarini avtomatik yaratish ────────────────────────────────────
['news', 'gallery', 'logos', 'banners', 'directors'].forEach(dir => {
  const fullPath = path.join(__dirname, 'public', 'uploads', dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// ── Database ──────────────────────────────────────────────────────────────────
connectDB();

// ── View Engine ───────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/public');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(methodOverride('_method'));

// ── Static Files ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Session ───────────────────────────────────────────────────────────────────
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'school-cms-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
};

if (process.env.MONGODB_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600,
    ttl: 7 * 24 * 60 * 60
  });
}

app.use(session(sessionConfig));
app.use(flash());

// ── Language & Globals ────────────────────────────────────────────────────────
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
    res.status(404).send('<h1>404</h1><a href="/">Bosh sahifaga</a>');
  }
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Xato:', err.stack);
  try {
    res.status(500).render('public/500', {
      layout: 'layouts/public',
      title: 'Server xatosi',
      error: process.env.NODE_ENV !== 'production' ? err.message : null
    });
  } catch (e) {
    res.status(500).send('<h1>500 - Server xatosi</h1><a href="/">Bosh sahifaga</a>');
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`📊 Admin:  http://localhost:${PORT}/admin/login`);
  console.log(`🌍 Muhit:  ${process.env.NODE_ENV || 'development'}`);
});
