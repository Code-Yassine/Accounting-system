const Document = require('../models/Document');
const Client = require('../models/Client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).single('file');

// Upload document
exports.uploadDocument = (req, res) => {
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

      let metadata;
      try {
        metadata = JSON.parse(req.body.metadata || '{}');
      } catch (e) {
        return res.status(400).json({ message: 'Invalid metadata format' });
      }

      const serverUrl = `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${serverUrl}/uploads/${req.file.filename}`;

      const document = new Document({
        title: metadata.title || req.file.originalname,
        fileUrl: fileUrl,
        fileType: path.extname(req.file.originalname).substring(1),
        category: metadata.category,
        metadata: metadata,
        client: metadata.client,
        status: 'new'
      });

      await document.save();
      res.status(201).json(document);
    } catch (error) {
      console.error('Error creating document:', error);
      res.status(500).json({ 
        message: 'Error saving document to database',
        error: error.message 
      });
    }
  });
};

// List documents for a specific client
exports.listDocuments = async (req, res) => {
  try {
    const search = req.query.search || '';
    const clientId = req.query.clientId;
    
    if (!clientId) {
      return res.status(400).json({ message: 'Client ID is required' });
    }
    
    // Build query with client filter
    const query = { client: clientId };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { fileType: { $regex: search, $options: 'i' } },
        { 'metadata.partyName': { $regex: search, $options: 'i' } },
        { 'metadata.reference': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Fetch documents with populated client info
    const documents = await Document.find(query)
      .populate('client', 'name')
      .sort({ createdAt: -1 });
    
    res.json(documents);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add document
exports.addDocument = async (req, res) => {
  try {
    const { 
      title, 
      fileUrl, 
      fileType, 
      category, 
      metadata, 
      client 
    } = req.body;
    
    // Validate required fields
    if (!title || !fileUrl || !fileType || !category || !client) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate metadata
    if (!metadata || !metadata.date || !metadata.partyName || !metadata.reference || !metadata.partyType) {
      return res.status(400).json({ message: 'Missing required metadata fields' });
    }

    // Normalize file type
    let normalizedFileType = fileType.toLowerCase();
    if (normalizedFileType === 'image/jpeg') {
      normalizedFileType = 'jpg';
    } else if (normalizedFileType === 'image/png') {
      normalizedFileType = 'png';
    } else if (normalizedFileType === 'application/pdf') {
      normalizedFileType = 'pdf';
    }
    
    const document = new Document({ 
      title,
      fileUrl,
      fileType: normalizedFileType,
      category,
      metadata,
      client,
      status: 'new'
    });
    
    await document.save();
    
    // Return populated document
    const populatedDocument = await Document.findById(document._id)
      .populate('client', 'name');
      
    res.status(201).json(populatedDocument);
  } catch (err) {
    console.error('Error adding document:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// // Set document in progress
// exports.setInProgress = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const document = await Document.findByIdAndUpdate(
//       id, 
//       { status: 'in_progress' }, 
//       { new: true }
//     ).populate('client', 'name');
    
//     if (!document) {
//       return res.status(404).json({ message: 'Document not found' });
//     }
    
//     res.json(document);
//   } catch (err) {
//     console.error('Error setting document in progress:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// Set document as processed
exports.setProcessed = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByIdAndUpdate(
      id, 
      { status: 'processed' }, 
      { new: true }
    ).populate('client', 'name');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (err) {
    console.error('Error setting document as processed:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reject document
exports.rejectDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByIdAndUpdate(
      id, 
      { status: 'rejected' }, 
      { new: true }
    ).populate('client', 'name');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (err) {
    console.error('Error rejecting document:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByIdAndDelete(id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

// Modify document
exports.modifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, fileUrl, fileType, category, metadata } = req.body;

    // Validate metadata if provided
    if (metadata && (!metadata.date && !metadata.partyName && !metadata.reference && !metadata.partyType)) {
      return res.status(400).json({ message: 'Missing required metadata fields' });
    }

    // First find the document to get current metadata
    const existingDocument = await Document.findById(id);
    if (!existingDocument) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Merge existing metadata with new metadata
    const updatedMetadata = {
      ...existingDocument.metadata,
      ...metadata
    };

    const document = await Document.findByIdAndUpdate(
      id,
      { 
        title, 
        fileUrl, 
        fileType, 
        category, 
        metadata: updatedMetadata,
        status: 'new' 
      },
      { new: true }
    ).populate('client', 'name');

    res.json(document);
  } catch (err) {
    console.error('Error modifying document:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get documents by accountant ID
exports.getDocumentsByAccountant = async (req, res) => {  try {
    console.log('=== Get Documents By Accountant ===');
    console.log('Authenticated user:', req.user);
    console.log('User ID type:', typeof req.user.id);
    
    const accountantId = req.user.id;
    const search = req.query.search || '';
    
    // Debug: Verify we're getting the right accountant ID
    console.log('Fetching documents for accountant:', accountantId);    // Get all clients assigned to this accountant
    const clients = await Client.find({ accountantId: accountantId }).select('_id name');
    console.log('Found clients:', clients);
    
    // If no clients found, check if accountant exists
    if (!clients || clients.length === 0) {
      console.log('Checking all clients in the system...');
      const allClients = await Client.find({}).select('accountantId _id name');
      console.log('All clients:', allClients);
    }
    
    if (!clients || clients.length === 0) {
      console.log('No clients found for accountant:', accountantId);
      return res.json([]); // Return empty array if no clients found
    }
    
    const clientIds = clients.map(client => client._id);
    
    // Build query
    const query = {
      client: { $in: clientIds }
    };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { fileType: { $regex: search, $options: 'i' } },
        { 'metadata.partyName': { $regex: search, $options: 'i' } },
        { 'metadata.reference': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Fetch documents
    const documents = await Document.find(query)
      .populate('client', 'name')
      .sort({ createdAt: -1 });
    
    console.log('Found documents:', documents.length); // Debug: Check how many documents we found
    
    res.json(documents);
  } catch (err) {
    console.error('Error fetching documents by accountant:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};