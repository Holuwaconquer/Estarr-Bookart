const ApiResponse = require("../utils/apiResponse");
const { validateEmail } = require("../utils/validation");
const { sendNewsletterSubscriptionEmail } = require("../services/emailService");

exports.subscribeToNewsletter = async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim() : "";

    if (!validateEmail(email)) {
      return ApiResponse.error(res, "Please provide a valid email address", 400);
    }

    await sendNewsletterSubscriptionEmail(email);

    return ApiResponse.success(res, "Newsletter subscription received");
  } catch (error) {
    next(error);
  }
};
