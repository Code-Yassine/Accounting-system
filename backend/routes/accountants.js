const express = require('express');
const router = express.Router();
const accountantController = require('../controllers/accountantController');
const auth = require('../middleware/auth');

// All routes require authentication
router.get('/', auth, accountantController.listAccountants);
router.post('/', auth, accountantController.addAccountant);
router.patch('/:id/activate', auth, accountantController.activateAccountant);
router.patch('/:id/deactivate', auth, accountantController.deactivateAccountant);
router.patch('/:id', auth, accountantController.modifyAccountant);
router.delete('/:id', auth, accountantController.deleteAccountant);

module.exports = router; 