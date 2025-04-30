const express = require('express');
const router = express.Router();
const deleteRequestController = require('../controllers/deleteRequestController');

// Create a new delete request
router.post('/', deleteRequestController.createDeleteRequest);

// Get all delete requests
router.get('/', deleteRequestController.getDeleteRequests);

// Update delete request status
router.patch('/:id', deleteRequestController.updateDeleteRequestStatus);

module.exports = router;
