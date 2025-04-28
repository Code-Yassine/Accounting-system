const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// List/search
router.get('/', clientController.listClients);
// Add
router.post('/', clientController.addClient);
// Accept client
router.patch('/:id/accept', clientController.acceptClient);
// Reject client
router.patch('/:id/reject', clientController.rejectClient);

// Delete
router.delete('/:id', clientController.deleteClient);

// Modify
router.put('/:id', clientController.modifyClient);

module.exports = router; 