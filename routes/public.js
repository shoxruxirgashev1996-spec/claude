const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const newsController = require('../controllers/newsController');

router.get('/', publicController.home);
router.get('/about', publicController.about);
router.get('/admission', publicController.admission);
router.post('/apply', publicController.applyPost);
router.get('/gallery', publicController.gallery);
router.get('/contact', publicController.contact);
router.post('/message', publicController.contactPost);
router.get('/budget', publicController.budget);
router.get('/news', newsController.publicList);
router.get('/news/:slug', newsController.publicDetail);

module.exports = router;
