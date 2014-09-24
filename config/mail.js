var nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport');

module.exports.mail = {

  transport: nodemailer.createTransport(smtpTransport({
    host: process.env['SMTP_HOSTNAME'],
    port: 465,
    secure: true,
    auth: {
      user: process.env['SMTP_USERNAME'],
      pass: process.env['SMTP_PASSWORD']
    }
  }))

};
