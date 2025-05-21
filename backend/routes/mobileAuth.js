const express = require('express');
const router = express.Router();
const { signIn } = require('../controllers/mobileAuthController');

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.post('/signin', signIn);

module.exports = router;