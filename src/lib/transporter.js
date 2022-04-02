const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "andikarfadhila@gmail.com",
    pass: "agruvltjlfhrhbas",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;
