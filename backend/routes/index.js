const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const contactRoutes = require('./contact');
const path = require('path');

const pagesPath = path.join(__dirname, '..', '..', 'frontend', 'Pages');

router.get('/', (req, res) => {
    res.sendFile(path.join(pagesPath, 'index.html'));
  });

  router.get('/signup', (req, res) => {
    res.sendFile(path.join(pagesPath, 'registration.html'));
  });

  router.get('/login', (req, res) => {
    res.sendFile(path.join(pagesPath, 'login.html'));
  });

  router.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(pagesPath, 'forgot-password.html'));
  });
  router.get('/reset-password', (req, res) => {
    res.sendFile(path.join(pagesPath, 'reset-password.html'));
  });

  router.get('/home', (req, res) => {
    res.sendFile(path.join(pagesPath, 'landingpage.html'));
  });

  router.get('/about', (req, res) => {
    res.sendFile(path.join(pagesPath, 'About.html'));
  });

  router.get('/contact', (req, res) => {
    res.sendFile(path.join(pagesPath, 'Contact.html'));
  });

//   router.get('/privacy', (req, res) => {
//     res.sendFile(path.join(pagesPath, 'Privacy.html'));
//   });

  router.get('/service', (req, res) => {
    res.sendFile(path.join(pagesPath, 'Service.html'));
  });
  
  router.get('/product-details', (req, res) => {
    res.sendFile(path.join(pagesPath, 'Details.html'));
  });

  router.get('/confirm', (req, res) => {
    res.sendFile(path.join(pagesPath, 'Confirm.html'));
  });

  router.get('/contactDetails', (req, res) => {
    res.sendFile(path.join(pagesPath, 'contactDetails.html'));
  }); 


router.use('/', authRoutes);
router.use('/', contactRoutes);

module.exports = router;