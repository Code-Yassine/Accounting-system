const mongoose = require('mongoose');

const deleteRequestSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  accountantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Accountant',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true, collection: 'deleteRequest' });

module.exports = mongoose.model('DeleteRequest', deleteRequestSchema); 