const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/uploads', folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${folder}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Faqat rasm fayllari qabul qilinadi'));
  }
};

const opts = { fileFilter, limits: { fileSize: 5 * 1024 * 1024 } };

module.exports = {
  uploadNews:     multer({ storage: createStorage('news'), ...opts }),
  uploadGallery:  multer({ storage: createStorage('gallery'), ...opts }),
  uploadLogo:     multer({ storage: createStorage('logos'), ...opts }),
  uploadBanner:   multer({ storage: createStorage('banners'), ...opts }),
  uploadStaff:    multer({ storage: createStorage('staff'), ...opts }),
};
