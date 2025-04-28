const Client = require('../models/Client');
const bcrypt = require('bcryptjs');


exports.listClients = async (req, res) => {
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
    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add client
exports.addClient = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const exists = await Client.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Client already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const client = new Client({ name, email, password: hashed, status: 'pending' });
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept client
exports.acceptClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndUpdate(id, { status: 'accepted' }, { new: true });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject client
exports.rejectClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);
    if (!client) return res.status(404).json({ message: 'client not found' });
    res.json({ message: 'client deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 

// Modify client
exports.modifyClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const existingClient = await Client.findOne({ email, _id: { $ne: id } });
    if (existingClient) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const client = await Client.findByIdAndUpdate(
      id,
      { name, email },
      { new: true }
    );

    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
