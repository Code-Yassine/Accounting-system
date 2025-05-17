const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'jpg', 'jpeg', 'png', 'image/jpeg', 'image/png', 'application/pdf'] 
  },
  category: {
    type: String,
    required: true,
    enum: [
      'purchase_invoice',
      'purchase_payment',
      'purchase_delivery',
      'sale_invoice',
      'sale_payment',
      'sale_delivery'
    ]
  },
  metadata: {
    date: { type: Date, required: true },
    amount: { type: Number },
    partyName: { type: String, required: true },
    partyType: {
      type: String,
      required: true,
      enum: ['Supplier', 'Customer']
    },
    reference: { type: String, required: true },
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
  }
}, { timestamps: true, collection: 'document' });

module.exports = mongoose.model('Document', documentSchema);
