const Client = require('../models/Client');
const bcrypt = require('bcryptjs');

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    user = await Client.findOne({ email });
    if (user) {
      // Check status
      if (user.status !== 'accepted') {
        return res.status(403).json({ message: 'Your account is not accepted. Please contact the administrator.' });
      }
      
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: 'Invalid credentials' });
      return res.json({ id: user._id, name: user.name, email: user.email, status: user.status, role: 'client' });
    }
    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 