const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  accountantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Accountant', required: true },
}, { timestamps: true,  collection: 'client' });

module.exports = mongoose.model('Client', clientSchema); 