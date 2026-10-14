const express = require('express');
const { handleWebhook } = require('../controllers/questpay.controller');

const router = express.Router();

router.post('/', handleWebhook);

module.exports = router;
