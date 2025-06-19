/**
 * Utility for sending emails using nodemailer.
 * Uses Gmail SMTP with credentials from environment variables.
 */

const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send an email.
 * @param {Object} param0 - { to, subject, html }
 */
async function sendEmail({ to, subject, html }) {
    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    });
}

module.exports = sendEmail;