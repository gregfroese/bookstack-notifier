// emailSender.js

const nodemailer = require('nodemailer');
const emailServer = process.env.emailServer;
const emailPort = process.env.emailPort;
const emailSender = process.env.emailSender;

// Create a transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: emailServer,
  port: emailPort,
  secure: false, // true for 465, false for other ports
//   auth: {
//     user: 'your-email@example.com',
//     pass: 'your-password'
//   }
});

function sendEmail(to, subject, html) {
  let mailOptions = {
    from: emailSender,
    to: to,
    subject: subject,
    html: html
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent to %s: %s', to, info.messageId);
  });
}

module.exports = sendEmail;