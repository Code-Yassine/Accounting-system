const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Increase payload size limits for JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

const authRoutes = require('./routes/auth');
const accountantsRoutes = require('./routes/accountants');
const clientsRoutes = require('./routes/clients');
const deleteRequestsRoutes = require('./routes/deleteRequests');
const mobileAuthRoutes = require('./routes/mobileAuth');
const documentsRoutes = require('./routes/documents'); // Add this line

app.use('/api/auth', authRoutes);
app.use('/api/accountants', accountantsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/deleteRequests', deleteRequestsRoutes);
app.use('/api/mobile', mobileAuthRoutes);
app.use('/api/documents', documentsRoutes); // Add this line

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});