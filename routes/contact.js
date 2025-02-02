const path = require('path');

const express = require('express');

const rootDir = require('../utils/path');

const router = express.Router();

router.get('/contactus', (req, res, next) => {
  res.sendFile(path.join(rootDir, 'views', 'contact-us.html'));
});

router.get('/success',(req, res, next) => {
    res.status(200).sendFile(path.join(rootDir, 'views', 'success.html'));
})

module.exports = router;
