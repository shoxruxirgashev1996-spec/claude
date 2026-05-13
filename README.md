# 🏫 Presidential School CMS

A complete, production-ready CMS for a government/presidential school website. Built with Node.js, Express, MongoDB, and EJS + Tailwind CSS.

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Install & Configure
```bash
cd school-cms
npm install

# Edit .env if needed (MongoDB URI, session secret)
nano .env
```

### 2. Seed the Database
```bash
npm run seed
```

### 3. Start the Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 4. Access
| URL | Description |
|-----|-------------|
| http://localhost:3000 | Public Website |
| http://localhost:3000/admin/login | Admin Panel |

**Default Admin Login:**
- Email: `superadmin@school.uz`
- Password: `admin123`

---

## 📁 Project Structure

```
school-cms/
├── config/
│   ├── database.js          # MongoDB connection
│   └── multer.js            # File upload config
├── controllers/
│   ├── authController.js    # Login/logout
│   ├── dashboardController.js
│   ├── newsController.js    # News CRUD
│   ├── adminController.js   # All admin modules
│   ├── userController.js    # User management
│   └── publicController.js  # Public pages
├── middleware/
│   └── index.js             # Auth, language, globals
├── models/
│   ├── User.js              # User model (bcrypt)
│   ├── News.js              # News model
│   └── index.js             # All other models
├── public/
│   └── uploads/             # Uploaded files
│       ├── news/
│       ├── gallery/
│       ├── logos/
│       ├── banners/
│       └── directors/
├── routes/
│   ├── admin.js             # All admin routes
│   └── public.js            # All public routes
├── scripts/
│   └── seed.js              # DB seeder
├── views/
│   ├── layouts/
│   │   ├── admin.ejs        # Admin layout
│   │   └── public.ejs       # Public layout
│   ├── admin/               # All admin views
│   └── public/              # All public views
├── .env
├── package.json
└── server.js
```

---

## ✨ Features

### Public Website
- **Home** — Hero banner, stats, latest news, gallery preview, CTA
- **About** — Mission, vision, history, leadership team
- **Admission** — Application form with step-by-step guide
- **News** — Paginated grid, category filter, detail view
- **Gallery** — Masonry layout with lightbox, category filter
- **Budget** — Transparent budget table + Chart.js visualization
- **Contact** — Contact form with working hours

### Admin Panel
| Module | Features |
|--------|----------|
| Dashboard | Stats cards, monthly charts, recent activity |
| News | Create/Edit/Delete, multilingual, image upload, pagination |
| Applications | View, update status (pending/accepted/rejected), notes |
| Messages | View, mark read, delete, modal preview |
| Gallery | Upload, categorize, delete, grid view |
| Budget | Add income/expense records, Chart.js monthly overview |
| Announcements | Create, toggle active/inactive, set expiry |
| About | Edit mission/vision/history, manage directors |
| Settings | Logo, banner, colors, background, contact info, site stats |
| Users | Create/disable/delete admins (Super Admin only) |

### System
- **Multi-language** — UZ / RU / EN (all content trilingual)
- **Dynamic theming** — Primary/secondary colors, logo, banner from DB
- **Role-based access** — Super Admin vs Admin
- **Security** — bcrypt passwords, session auth, XSS protection
- **File uploads** — Multer, stored in /public/uploads/

---

## 🔐 User Roles

| Feature | Admin | Super Admin |
|---------|-------|-------------|
| Manage content | ✅ | ✅ |
| View messages/applications | ✅ | ✅ |
| Manage budget | ✅ | ✅ |
| Site settings | ✅ | ✅ |
| Create/delete users | ❌ | ✅ |
| Assign roles | ❌ | ✅ |

---

## 🌐 Routes Reference

### Public
```
GET  /                → Home page
GET  /about           → About page
GET  /admission       → Admission page
POST /apply           → Submit application
GET  /news            → News list
GET  /news/:slug      → News detail
GET  /gallery         → Gallery
GET  /contact         → Contact page
POST /message         → Submit message
GET  /budget          → Budget transparency
```

### Admin
```
GET  /admin/login
POST /admin/login
GET  /admin/logout
GET  /admin/dashboard

GET  /admin/news
GET  /admin/news/create
POST /admin/news/create
GET  /admin/news/:id/edit
POST /admin/news/:id/edit
POST /admin/news/:id/delete

GET  /admin/contacts
POST /admin/contacts/:id/read
POST /admin/contacts/:id/delete

GET  /admin/applications
POST /admin/applications/:id/status
POST /admin/applications/:id/delete

GET  /admin/gallery
POST /admin/gallery/upload
POST /admin/gallery/:id/delete

GET  /admin/budget
POST /admin/budget/create
POST /admin/budget/:id/delete

GET  /admin/announcements
POST /admin/announcements/create
POST /admin/announcements/:id/toggle
POST /admin/announcements/:id/delete

GET  /admin/about
POST /admin/about/save
POST /admin/about/directors/add
POST /admin/about/directors/:id/delete

GET  /admin/settings
POST /admin/settings/save
POST /admin/settings/stats
POST /admin/settings/password

GET  /admin/users           (Super Admin only)
POST /admin/users/create
POST /admin/users/:id/delete
POST /admin/users/:id/toggle
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Frontend | EJS + Tailwind CSS (CDN) |
| Charts | Chart.js |
| File Upload | Multer |
| Auth | express-session + bcryptjs |
| Flash | connect-flash |
| XSS | xss package |

---

## ⚙️ Environment Variables (.env)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/school_cms
SESSION_SECRET=your_super_secret_key_here
NODE_ENV=development
```

---

## 🎨 Customization

1. **Logo & Colors** → Admin Panel → Settings
2. **Banner text** → Admin Panel → Settings
3. **About content** → Admin Panel → About Page
4. **Statistics** → Admin Panel → Settings → Site Statistics
5. **News categories** → Edit in `views/admin/news/form.ejs`

---

## 📦 Production Deployment

```bash
# Set production env
NODE_ENV=production

# Use MongoDB Atlas URI
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/school_cms

# Use strong session secret
SESSION_SECRET=64_char_random_string_here

# Optional: use PM2
npm install -g pm2
pm2 start server.js --name school-cms
```

---

## 🔒 Security Checklist

- [x] bcrypt password hashing (12 rounds)
- [x] Session-based authentication
- [x] Role-based access control
- [x] XSS sanitization (xss package)
- [x] File type validation (images only)
- [x] File size limits (5MB)
- [x] HTTP-only session cookies
- [x] Input validation

---

Made with ❤️ for Presidential Schools of Uzbekistan
