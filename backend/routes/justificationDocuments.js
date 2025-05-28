const express = require('express');
const router = express.Router();
const justificationDocumentController = require('../controllers/justificationDocumentController');
const auth = require('../middleware/auth');

// Upload justification document
router.post('/upload', justificationDocumentController.uploadJustification);

// Get justification document by document ID
router.get('/document/:documentId', auth, justificationDocumentController.getJustificationByDocumentId);

module.exports = router; 