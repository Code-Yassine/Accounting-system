const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// POST /api/ocr/extract
router.post('/extract', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  const imagePath = req.file.path;
  const python = spawn('python', [
    path.join(__dirname, '../scripts/ocr_extract.py'),
    imagePath
  ]);

  let data = '';
  python.stdout.on('data', (chunk) => {
    data += chunk.toString();
  });

  python.stderr.on('data', (err) => {
    console.error('OCR error:', err.toString());
  });

  python.on('close', (code) => {
    fs.unlinkSync(imagePath); // Clean up uploaded file
    try {
      const result = JSON.parse(data);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: 'OCR failed' });
    }
  });
});

module.exports = router;
