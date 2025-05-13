const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');

// List/search for clients (filtered by accountantId)
router.get('/', auth, clientController.listClients);
// List all clients (for admin)
router.get('/all', auth, clientController.listAllClients);
// Add
router.post('/', auth, clientController.addClient);
// Accept client
router.patch('/:id/accept', auth, clientController.acceptClient);
// Reject client
router.patch('/:id/reject', auth, clientController.rejectClient);
// Delete
router.delete('/:id', auth, clientController.deleteClient);
// Modify
router.put('/:id', auth, clientController.modifyClient);

module.exports = router; 