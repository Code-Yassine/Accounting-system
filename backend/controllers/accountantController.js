const Accountant = require('../models/Accountant');
const bcrypt = require('bcryptjs');

// List/search accountants
exports.listAccountants = async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    const accountants = await Accountant.find(query).sort({ createdAt: -1 });
    res.json(accountants);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add accountant
exports.addAccountant = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const exists = await Accountant.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Accountant already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const accountant = new Accountant({ name, email, password: hashed, status: 'active' });
    await accountant.save();
    res.status(201).json(accountant);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Activate accountant
exports.activateAccountant = async (req, res) => {
  try {
    const { id } = req.params;
    const accountant = await Accountant.findByIdAndUpdate(id, { status: 'active' }, { new: true });
    if (!accountant) return res.status(404).json({ message: 'Accountant not found' });
    res.json(accountant);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Deactivate accountant
exports.deactivateAccountant = async (req, res) => {
  try {
    const { id } = req.params;
    const accountant = await Accountant.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
    if (!accountant) return res.status(404).json({ message: 'Accountant not found' });
    res.json(accountant);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete accountant
exports.deleteAccountant = async (req, res) => {
  try {
    const { id } = req.params;
    const accountant = await Accountant.findByIdAndDelete(id);
    if (!accountant) return res.status(404).json({ message: 'Accountant not found' });
    res.json({ message: 'Accountant deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Modify accountant
exports.modifyAccountant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    
    if (!name && !email && !password) {
      return res.status(400).json({ message: 'At least one field must be provided' });
    }
    
    // Check if email is already in use by another accountant
    if (email) {
      const existingAccountant = await Accountant.findOne({ email, _id: { $ne: id } });
      if (existingAccountant) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    
    const accountant = await Accountant.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!accountant) return res.status(404).json({ message: 'Accountant not found' });
    
    res.json(accountant);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 