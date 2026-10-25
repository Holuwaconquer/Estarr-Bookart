const ApiResponse = require("../utils/apiResponse");
const { validateEmail } = require("../utils/validation");
const {
  sendContactMessageEmail,
  sendNewsletterSubscriptionEmail,
} = require("../services/emailService");
const NewsletterSubscriber = require("../models/NewsletterSubscriber");

exports.sendContactMessage = async (req, res, next) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const subject = typeof req.body?.subject === "string" ? req.body.subject.trim() : "";
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!name || name.length > 120) {
      return ApiResponse.error(res, "Please provide a name (maximum 120 characters)", 400);
    }
    if (!validateEmail(email)) {
      return ApiResponse.error(res, "Please provide a valid email address", 400);
    }
    if (!subject || subject.length > 180 || /[\r\n]/.test(subject)) {
      return ApiResponse.error(res, "Please provide a valid subject (maximum 180 characters)", 400);
    }
    if (!message || message.length > 5000) {
      return ApiResponse.error(res, "Please provide a message (maximum 5000 characters)", 400);
    }

    await sendContactMessageEmail({ name, email, subject, message });
    return ApiResponse.success(res, "Your message has been sent successfully");
  } catch (error) {
    next(error);
  }
};

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
