const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate a random JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

// Create or update .env file
const envPath = path.join(__dirname, '.env');
const envContent = `JWT_SECRET=${jwtSecret}\nPORT=5000\nMONGO_URL=mongodb://localhost:27017/finbooks`;

fs.writeFileSync(envPath, envContent);

console.log('JWT secret has been generated and added to .env file');
