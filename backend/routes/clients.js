const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// List/search for accountants (filtered by accountantId)
router.get('/', clientController.listClients);
// List all clients (for admin)
router.get('/all', clientController.listAllClients);
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