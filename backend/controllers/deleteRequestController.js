const DeleteRequest = require('../models/DeleteRequest');
const Client = require('../models/Client');

// Create a new delete request
exports.createDeleteRequest = async (req, res) => {
  try {
    const { clientId, accountantId } = req.body;

    // Check if client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if there's already a pending request
    const existingRequest = await DeleteRequest.findOne({
      clientId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A pending delete request already exists for this client' });
    }

    const deleteRequest = new DeleteRequest({
      clientId,
      accountantId,
      status: 'pending'
    });

    await deleteRequest.save();
    res.status(201).json(deleteRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating delete request', error: error.message });
  }
};

// Get all delete requests
exports.getDeleteRequests = async (req, res) => {
  try {
    const deleteRequests = await DeleteRequest.find()
      .populate('clientId', 'name email')
      .populate('accountantId', 'name email')
      .sort({ createdAt: -1 });
    res.json(deleteRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delete requests', error: error.message });
  }
};

// Update delete request status
exports.updateDeleteRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const deleteRequest = await DeleteRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('clientId', 'name email')
     .populate('accountantId', 'name email');

    if (!deleteRequest) {
      return res.status(404).json({ message: 'Delete request not found' });
    }

    // If approved, delete the client
    if (status === 'approved') {
      await Client.findByIdAndDelete(deleteRequest.clientId._id);
    }

    res.json(deleteRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error updating delete request', error: error.message });
  }
};
