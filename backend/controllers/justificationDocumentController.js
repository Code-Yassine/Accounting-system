const JustificationDocument = require('../models/JustificationDocument');
const Document = require('../models/Document');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/justifications');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'justification-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).single('file');

// Upload justification document
exports.uploadJustification = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        message: 'File upload error',
        error: err.message 
      });
    } else if (err) {
      return res.status(500).json({ 
        message: 'Server error during upload',
        error: err.message 
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { documentId } = req.body;
      if (!documentId) {
        return res.status(400).json({ message: 'Document ID is required' });
      }

      // Check if document exists
      const document = await Document.findById(documentId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const serverUrl = `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${serverUrl}/uploads/justifications/${req.file.filename}`;

      const justificationDoc = new JustificationDocument({
        documentId,
        fileUrl,
        fileType: path.extname(req.file.originalname).substring(1),
        title: req.file.originalname
      });

      await justificationDoc.save();
      res.status(201).json(justificationDoc);
    } catch (error) {
      console.error('Error creating justification document:', error);
      res.status(500).json({ 
        message: 'Error saving justification document',
        error: error.message 
      });
    }
  });
};

// Get justification document by document ID
exports.getJustificationByDocumentId = async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const justification = await JustificationDocument.findOne({ documentId });
    if (!justification) {
      return res.status(404).json({ message: 'Justification document not found' });
    }
    
    res.json(justification);
  } catch (err) {
    console.error('Error fetching justification document:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
