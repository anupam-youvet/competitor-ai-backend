const nodemailer = require("nodemailer");
require("dotenv").config();

// Utility function to clean html response
function cleanHtmlResponse(responseText) {
  let cleaned = responseText.trim();

  if (cleaned.startsWith("```html")) {
    cleaned = cleaned.replace("```html", "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replaceAll("```", "");
  }

  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }

  cleaned = cleaned.replace(/^\s*html\s*/i, "");
  return cleaned.trim();
}

async function sendMail(email, body, subject) {
  try {
    // Send email notifications to authors
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587, // or 465 for SSL
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // SES SMTP username
        pass: process.env.EMAIL_PASS, // SES SMTP password
      },
    });

    await transporter.sendMail({
      from: `Twella <${process.env.EMAIL}>`,
      to: email,
      subject: subject,
      html: body,
    });
  } catch (error) {
    console.log("mail error", error);
  }
}

// const email = 'ajitca.1999@gmail.com'
// const body = 'This is a test email'
// const subject = 'Verification OTP'

// sendMail(email, body, subject)

module.exports = { cleanHtmlResponse, sendMail };
