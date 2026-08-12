const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD,
  },
  // Render's outbound network doesn't support IPv6. Without this, Node can
  // resolve smtp.gmail.com to an IPv6 address and fail with ENETUNREACH.
  // Forcing IPv4 avoids that.
  family: 4,
});

async function sendResetEmail(toEmail, resetLink) {
  const mailOptions = {
    from: `"CMS Support" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>You requested a password reset for your account.</p>
        <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Reset email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending reset email:", error);
    return false;
  }
}

module.exports = {
  sendResetEmail,
};
