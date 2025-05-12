const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'jpg', 'jpeg', 'png'] 
  },
  category: {
    type: String,
    required: true,
    enum: ['Purchase', 'Sale', 'Payment Receipt', 'Delivery Note']
  },
  metadata: {
    date: { type: Date, required: true },
    amount: { type: Number },
    currency: { type: String },
    partyName: { type: String }, // Supplier or Customer name
    partyType: {
      type: String,
      enum: ['Supplier', 'Customer']
    },
    reference: { type: String }, // Invoice/Receipt number etc
    notes: { type: String }
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Client'
  },
  status: {
    type: String,
    required: true,
    enum: ['new', 'in_progress', 'processed', 'rejected'],
    default: 'new'
  },
  assignedAccountant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Accountant'
  },
}, { timestamps: true , collection: 'document' });

module.exports = mongoose.model('Document', documentSchema);
