const Document = require('../models/Document');
const Client = require('../models/Client');
const Accountant = require('../models/Accountant');

// For admin to view all documents
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
    
    // Fetch documents with populated client and accountant info
    const documents = await Document.find(query)
      .populate('client', 'name')
      .populate('assignedAccountant', 'name')
      .sort({ createdAt: -1 });
    
    res.json(documents);
  } catch (err) {
    console.error('Error fetching all documents:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

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
    
    // Fetch documents with populated client and accountant info
    const documents = await Document.find(query)
      .populate('client', 'name')
      .populate('assignedAccountant', 'name')
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
    const { title, fileUrl, fileType, category, metadata, client, assignedAccountant } = req.body;
    
    // Validate required fields
    if (!title || !fileUrl || !fileType || !category || !client || !assignedAccountant) {
      return res.status(400).json({ message: 'All required fields are missing' });
    }
    
    // Validate metadata
    if (!metadata || !metadata.date) {
      return res.status(400).json({ message: 'Document date is required in metadata' });
    }
    
    const document = new Document({ 
      title,
      fileUrl,
      fileType,
      category,
      metadata,
      client,
      assignedAccountant,
      status: 'new'
    });
    
    await document.save();
    
    // Return populated document
    const populatedDocument = await Document.findById(document._id)
      .populate('client', 'name')
      .populate('assignedAccountant', 'name');
      
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
    ).populate('client', 'name').populate('assignedAccountant', 'name');
    
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
    ).populate('client', 'name').populate('assignedAccountant', 'name');
    
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
    ).populate('client', 'name').populate('assignedAccountant', 'name');
    
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
    if (metadata && !metadata.date) {
      return res.status(400).json({ message: 'Document date is required in metadata' });
    }

    const document = await Document.findByIdAndUpdate(
      id,
      { 
        title, 
        fileUrl, 
        fileType, 
        category, 
        metadata,
        status: 'new' 
      },
      { new: true }
    ).populate('client', 'name').populate('assignedAccountant', 'name');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (err) {
    console.error('Error modifying document:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};