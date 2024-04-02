// emailSender.js

const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: '192.168.5.3',
  port: 25,
  secure: false, // true for 465, false for other ports
//   auth: {
//     user: 'your-email@example.com',
//     pass: 'your-password'
//   }
});

function sendEmail(to, subject, html) {
  let mailOptions = {
    from: '"Bookstack Notifier" <greg.froese+bookstack@gmail.com>',
    to: to,
    subject: subject,
    html: html
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });
}

module.exports = sendEmail;