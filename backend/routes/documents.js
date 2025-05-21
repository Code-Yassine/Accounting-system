const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middleware/auth');

// List all documents
router.get('/all', auth, documentController.listAllDocuments);

// Get documents for current accountant
router.get('/accountant', auth, documentController.getDocumentsByAccountant);

// List documents for a specific client
router.get('/', documentController.listDocuments);

// Upload document route
router.post('/upload', documentController.uploadDocument);

// Add new document
router.post('/', documentController.addDocument);

// Set document status to in progress
router.patch('/:id/in-progress', auth, documentController.setInProgress);

// Set document status to processed
router.patch('/:id/processed', auth, documentController.setProcessed);

// Reject document
router.patch('/:id/reject', auth, documentController.rejectDocument);

// Delete document
router.delete('/:id', auth, documentController.deleteDocument);

// Modify document
router.put('/:id', auth, documentController.modifyDocument);

module.exports = router;