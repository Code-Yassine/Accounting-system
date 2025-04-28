const mongoose = require('mongoose');

const accountantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true,  collection: 'accountant' });

module.exports = mongoose.model('Accountant', accountantSchema); 