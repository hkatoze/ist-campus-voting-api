const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY; 

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendOtpEmail(to, code) {
  const sender = {
    email: process.env.FROM_EMAIL,
    name: "Vote IST AZIMMO",
  };

  const subject = "Votre code OTP • Campus Voting";

  const textContent = `Votre code de connexion est : ${code}\nIl expire dans 1H.`;

  const htmlContent = `
    <h2>Code OTP</h2>
    <p>Votre code de connexion est :</p>
    <div style="font-size:22px; font-weight:bold; letter-spacing:3px;">
      ${code}
    </div>
    <p>Il expire dans <b>1H</b>.</p>
  `;

  try {
    await emailApi.sendTransacEmail({
      sender,
      to: [{ email: to }],
      subject,
      textContent,
      htmlContent,
    });

    console.log("OTP email sent to:", to);
  } catch (error) {
    console.error("Brevo email error:", error);
    throw new Error("Erreur lors de l’envoi du mail OTP");
  }
}

module.exports = { sendOtpEmail };
