const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// List all documents
router.get('/all', documentController.listAllDocuments);

// List documents for a specific client
router.get('/', documentController.listDocuments);

// Add new document
router.post('/', documentController.addDocument);

// Set document status to in progress
router.patch('/:id/in-progress', documentController.setInProgress);

// Set document status to processed
router.patch('/:id/processed', documentController.setProcessed);

// Reject document
router.patch('/:id/reject', documentController.rejectDocument);

// Delete document
router.delete('/:id', documentController.deleteDocument);

// Modify document
router.put('/:id', documentController.modifyDocument);

module.exports = router;