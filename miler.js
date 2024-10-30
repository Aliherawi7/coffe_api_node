const nodemailer = require('nodemailer');

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",  // Using Gmail as the email service
  auth: {
    user: process.env.EMAIL,   // Your email address from .env
    pass: process.env.PASSWORD // Your password from .env (make sure to use an App password if needed)
  }
});

module.exports = transporter; // Export the transporter
