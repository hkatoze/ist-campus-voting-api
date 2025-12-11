const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendOtpEmail(to, code) {
  try {
    const sendSmtpEmail = {
      sender: { email: process.env.FROM_EMAIL, name: "Campus Voting" },
      to: [{ email: to }],
      subject: "Votre code OTP - Vote Campus",
      htmlContent: `
        <p>Bonjour,</p>
        <p>Votre code OTP est : <strong>${code}</strong></p>
        <p>Il expire dans 1H.</p>
      `,
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Brevo email sent:", result);
  } catch (error) {
    console.error("BREVO ERROR:", error.response?.body || error);
    throw new Error("Erreur lors de l’envoi du mail OTP");
  }
}

module.exports = { sendOtpEmail };
