const express = require('express');
const router = express.Router();
const deleteRequestController = require('../controllers/deleteRequestController');
const auth = require('../middleware/auth');

// Create a new delete request
router.post('/', auth, deleteRequestController.createDeleteRequest);

// Get all delete requests
router.get('/', auth, deleteRequestController.getDeleteRequests);

// Update delete request status
router.patch('/:id', auth, deleteRequestController.updateDeleteRequestStatus);

module.exports = router;