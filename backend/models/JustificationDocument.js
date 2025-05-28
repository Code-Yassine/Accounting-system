const mongoose = require('mongoose');

const justificationDocumentSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Document'
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'jpg', 'jpeg', 'png', 'image/jpeg', 'image/png', 'application/pdf']
  },
  title: {
    type: String,
    required: true,
    default: 'Justification Document'
  }
}, { timestamps: true , collection: 'justificationDocument' });

module.exports = mongoose.model('JustificationDocument', justificationDocumentSchema); 