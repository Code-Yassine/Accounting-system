const Document = require('../models/Document');
const Client = require('../models/Client');

// List all documents
exports.listAllDocuments = async (req, res) => {
  try {
    const search = req.query.search || '';
    
    // Build query for search
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { fileType: { $regex: search, $options: 'i' } },
            { 'metadata.partyName': { $regex: search, $options: 'i' } },
            { 'metadata.reference': { $regex: search, $options: 'i' } }
          ],
        }
      : {};
    
    // Fetch documents with populated client info
    const documents = await Document.find(query)
      .populate('client', 'name')
      .sort({ createdAt: -1 });
    
    res.json(documents);
  } catch (err) {
    console.error('Error fetching all documents:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
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

// Set document in progress
exports.setInProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByIdAndUpdate(
      id, 
      { status: 'in_progress' }, 
      { new: true }
    ).populate('client', 'name');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (err) {
    console.error('Error setting document in progress:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

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