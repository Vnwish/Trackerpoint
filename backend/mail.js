const nodemailer = require('nodemailer');

// Function to send an email
async function sendEmail(to, subject, text) {
  // Create a transporter using your email service's configuration
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'trackerzpoint@gmail.com',
      pass: 'pjcekmmgzpjcisbh',
    },
  });

  // Configure the email options
  const mailOptions = {
    from: 'trackerzpoint@gmail.com',
    to,
    subject,
    text,
  };

  // Send the email
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.messageId);
}

module.exports = {
  sendEmail,
};
