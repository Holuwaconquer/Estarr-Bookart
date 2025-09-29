const express = require('express');
const router = express.Router();

// Placeholder order tracking endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Track order endpoint (to be implemented)' });
});

module.exports = router;