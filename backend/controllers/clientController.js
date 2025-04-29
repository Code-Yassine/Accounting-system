const Client = require('../models/Client');
const bcrypt = require('bcryptjs');
const Accountant = require('../models/Accountant');

// For admin to view all clients
exports.listAllClients = async (req, res) => {
  try {
    const search = req.query.search || '';
    
    // Build query for search only
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    
    // Fetch all clients without accountantId filter
    const clients = await Client.find(query).sort({ createdAt: -1 });
    
    // Populate accountant info for all clients
    const clientsWithPopulatedData = await Promise.all(
      clients.map(async (client) => {
        const clientObj = client.toObject();
        
        // Set a default accountant name using the accountant's ID
        clientObj.accountantName = clientObj.accountantId 
          ? clientObj.accountantId.toString() 
          : "No Accountant";
        
        // Try to find the accountant by ID
        if (clientObj.accountantId) {
          try {
            const accountant = await Accountant.findById(clientObj.accountantId);
            if (accountant) {
              clientObj.accountantName = accountant.name || `Accountant #${clientObj.accountantId.toString()}`;
            } else {
              console.log(`No accountant found with ID ${clientObj.accountantId}`);
            }
          } catch (error) {
            console.error(`Error finding accountant for client ${clientObj._id}:`, error);
          }
        }
        
        return clientObj;
      })
    );
    
    res.json(clientsWithPopulatedData);
  } catch (err) {
    console.error('Error fetching all clients:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listClients = async (req, res) => {
  try {
    const search = req.query.search || '';
    const accountantId = req.query.accountantId;
    
    // Return error if accountantId is not provided
    if (!accountantId) {
      return res.status(400).json({ message: 'Accountant ID is required' });
    }
    
    // Build query to filter by search term AND accountantId
    const query = {
      accountantId: accountantId
    };
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    // First fetch all clients for this accountant
    const clients = await Client.find(query).sort({ createdAt: -1 });
    
    // Then populate accountant info for clients
    const clientsWithPopulatedData = await Promise.all(
      clients.map(async (client) => {
        const clientObj = client.toObject();
        
        // Set a default accountant name using the accountant's ID
        clientObj.accountantName = clientObj.accountantId.toString();
        
        // Try to find the accountant user by ID
        if (clientObj.accountantId) {
          try {
            const accountant = await Accountant.findById(clientObj.accountantId);
            if (accountant) {
              // Get the name from the accountant object
              clientObj.accountantName = accountant.name || `Accountant #${clientObj.accountantId.toString()}`;
            } else {
              console.log(`No accountant found with ID ${clientObj.accountantId}`);
            }
          } catch (error) {
            console.error(`Error finding accountant for client ${clientObj._id}:`, error);
          }
        }
        
        return clientObj;
      })
    );
    
    res.json(clientsWithPopulatedData);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add client
exports.addClient = async (req, res) => {
  try {
    const { name, email, password, accountantId } = req.body;
    if (!name || !email || !password || !accountantId) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const exists = await Client.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Client already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const client = new Client({ 
      name, 
      email, 
      password: hashed, 
      status: 'pending',
      accountantId
    });
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

    // Always set status to pending when client is modified
    const client = await Client.findByIdAndUpdate(
      id,
      { name, email, status: 'pending' },
      { new: true }
    );

    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};