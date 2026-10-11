const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Sends an SMS notification to the customer
 * @param {string} phoneNumber - Customer's phone number
 * @param {string} message - Message content
 */
const sendSmsNotification = async (phoneNumber, message) => {
  if (!client) {
    console.warn("Twilio not configured; skipping SMS");
    return;
  }
  try {
    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });
    console.log(`SMS sent to ${phoneNumber}: ${response.sid}`);
  } catch (error) {
    console.error("❌ Error sending SMS:", error.message);
  }
};

module.exports = { sendSmsNotification };
