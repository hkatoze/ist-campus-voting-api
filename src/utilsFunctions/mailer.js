const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(to, code) {
  const from = process.env.FROM_EMAIL;
  const subject = "Code OTP - Vote Campus";
  const text = `Votre code de connexion est : ${code}\nIl expire dans 1H.`;
  //await transporter.sendMail({ from, to, subject, text });
}

module.exports = { sendOtpEmail };
