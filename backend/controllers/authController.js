const Admin = require('../models/Admin');
const Accountant = require('../models/Accountant');
const bcrypt = require('bcryptjs');

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check Admin
    let user = await Admin.findOne({ email });
    if (user) {
      // Plain text password comparison
      if (password !== user.password) return res.status(400).json({ message: 'Invalid credentials' });
      return res.json({ id: user._id, name: user.name, email: user.email, role: 'admin' });
    }
    // Check Accountant
    user = await Accountant.findOne({ email });
    if (user) {
      // Check status
      if (user.status !== 'active') {
        return res.status(403).json({ message: 'Your account is not active. Please contact the administrator.' });
      }
      // Hashed password comparison
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: 'Invalid credentials' });
      return res.json({ id: user._id, name: user.name, email: user.email, status: user.status, role: 'accountant' });
    }
    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 