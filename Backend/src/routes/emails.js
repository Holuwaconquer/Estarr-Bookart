const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  sendContactMessage,
  subscribeToNewsletter,
} = require("../controllers/email.controller");

const router = express.Router();
const contactMessageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many contact messages sent. Please try again later.",
  },
});

router.post("/contact", contactMessageLimiter, sendContactMessage);
router.post("/newsletter-subscribe", subscribeToNewsletter);

module.exports = router;
