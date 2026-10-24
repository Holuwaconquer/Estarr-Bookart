const mongoose = require("mongoose");

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    welcomeEmailSentAt: Date,
    adminNotificationSentAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);
