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
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files allowed'));
};

const uploadNews = multer({ storage: createStorage('news'), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadGallery = multer({ storage: createStorage('gallery'), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadLogo = multer({ storage: createStorage('logos'), fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
const uploadBanner = multer({ storage: createStorage('banners'), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadDirector = multer({ storage: createStorage('directors'), fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

module.exports = { uploadNews, uploadGallery, uploadLogo, uploadBanner, uploadDirector };
