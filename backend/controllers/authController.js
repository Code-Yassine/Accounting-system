const jwt = require('jsonwebtoken'); // Make sure this is installed
const Admin = require('../models/Admin');
const Accountant = require('../models/Accountant');
const bcrypt = require('bcryptjs');

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await Admin.findOne({ email });
    if (user) {
      if (password !== user.password) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: 'admin' } });
    }

    user = await Accountant.findOne({ email });
    if (user) {
      if (user.status !== 'active') {
        return res.status(403).json({ message: 'Your account is not active. Please contact the administrator.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id, role: 'accountant' }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: 'accountant' } });
    }

    return res.status(404).json({ message: 'User not found' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};