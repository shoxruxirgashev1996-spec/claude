require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const connectDB = require('./config/database');
const { injectGlobals, setLanguage } = require('./middleware');

const app = express();

// Connect Database
connectDB();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/public');

// Middleware
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(methodOverride('_method'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'school-cms-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true
  }
}));

// Flash
app.use(flash());

// Language & Global Injection
app.use(setLanguage);
app.use(injectGlobals);

// Routes
app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/public'));

// 404 Handler
app.use((req, res) => {
  res.status(404).render('public/404', {
    layout: 'layouts/public',
    title: '404 - Page Not Found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('<h1>Server Error</h1><p>' + err.message + '</p>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin Panel:  http://localhost:${PORT}/admin/login`);
  console.log(`🌐 Public Site:  http://localhost:${PORT}`);
  console.log('\n Default Login:');
  console.log('   Email:    superadmin@school.uz');
  console.log('   Password: admin123\n');
});
