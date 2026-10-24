const ApiResponse = require("../utils/apiResponse");
const { validateEmail } = require("../utils/validation");
const { sendNewsletterSubscriptionEmail } = require("../services/emailService");
const NewsletterSubscriber = require("../models/NewsletterSubscriber");

exports.subscribeToNewsletter = async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim() : "";

    if (!validateEmail(email)) {
      return ApiResponse.error(res, "Please provide a valid email address", 400);
    }

    const normalizedEmail = email.toLowerCase();
    const subscriptionResult = await NewsletterSubscriber.updateOne(
      { email: normalizedEmail },
      { $setOnInsert: { email: normalizedEmail } },
      { upsert: true, runValidators: true },
    );
    const subscriber = await NewsletterSubscriber.findOne({ email: normalizedEmail });
    if (!subscriber) {
      throw new Error("Newsletter subscription could not be saved");
    }

    const deliveries = await sendNewsletterSubscriptionEmail(normalizedEmail, {
      sendWelcome: !subscriber.welcomeEmailSentAt,
      sendAdmin: !subscriber.adminNotificationSentAt,
    });
    const failures = [];

    deliveries.forEach((delivery) => {
      if (delivery.error) {
        failures.push(`${delivery.type} email: ${delivery.error}`);
      } else if (delivery.type === "welcome") {
        subscriber.welcomeEmailSentAt = new Date();
      } else if (delivery.type === "admin") {
        subscriber.adminNotificationSentAt = new Date();
      }
    });

    if (deliveries.length > 0) await subscriber.save();
    if (failures.length > 0) {
      throw new Error(`Newsletter email delivery failed: ${failures.join("; ")}`);
    }

    return ApiResponse.success(res, "Newsletter subscription received", {
      subscribed: true,
      alreadySubscribed: subscriptionResult.upsertedCount === 0,
      email: normalizedEmail,
    });
  } catch (error) {
    next(error);
  }
};
