const express = require("express");
const { subscribeToNewsletter } = require("../controllers/email.controller");

const router = express.Router();

router.post("/newsletter-subscribe", subscribeToNewsletter);

module.exports = router;
