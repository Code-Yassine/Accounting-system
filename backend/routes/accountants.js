const express = require('express');
const router = express.Router();
const accountantController = require('../controllers/accountantController');

// List/search
router.get('/', accountantController.listAccountants);
// Add
router.post('/', accountantController.addAccountant);
// Activate
router.patch('/:id/activate', accountantController.activateAccountant);
// Deactivate
router.patch('/:id/deactivate', accountantController.deactivateAccountant);
// Modify
router.patch('/:id', accountantController.modifyAccountant);
// Delete
router.delete('/:id', accountantController.deleteAccountant);

module.exports = router; 