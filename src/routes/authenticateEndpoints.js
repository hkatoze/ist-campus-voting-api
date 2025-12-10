const db = require("../db/sequelize");
const { Student, Otp } = db.models;
const { Op, ValidationError } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const {sendOtpEmail} = require("../utilsFunctions/mailer")
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (app) => {
  /**
   * =====================================================
   *  POST /api/v1/auth/request-otp
   * =====================================================
   *  - L'étudiant fournit email + matricule
   *  - Le backend vérifie et envoie un OTP
   */
app.post("/api/v1/auth/request-otp", async (req, res) => {
  const { email, matricule } = req.body;

  if (!email || !matricule) {
    return res.status(400).json({
      success: false,
      message: "Email et matricule requis.",
    });
  }

  try {
    // 🔍 On cherche l’étudiant UNIQUEMENT avec le matricule
    const student = await Student.findOne({ where: { matricule } });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Étudiant introuvable.",
      });
    }

    // 🧠 Cas 1 : étudiant SANS email encore enregistré → première connexion
    if (!student.email) {
      console.log("✨ Premier login de l’étudiant → enregistrement de l’email");
      student.email = email;
      await student.save();
    }
    // 🧠 Cas 2 : étudiant AVEC email enregistré → on doit vérifier que l’email correspond
    else if (student.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "L'adresse email ne correspond pas à celle assigné à votre matricule.",
      });
    }

    // Génération OTP — 6 chiffres
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({
      student_id: student.id,
      code: otpCode,
      used: false,
      expires_at: expiresAt,
    });

    // 📧 Envoi email
    await sendOtpEmail(student.email, otpCode);

    return res.status(200).json({
      success: true,
      message: "OTP envoyé avec succès.",
    });
  } catch (error) {
    console.error("Erreur /auth/request-otp :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l’envoi du code OTP.",
      data: error.message,
    });
  }
});


  /**
   * =====================================================
   *  POST /api/v1/auth/verify-otp
   * =====================================================
   *  - Vérifie l’OTP et connecte l’étudiant
   */
app.post("/api/v1/auth/verify-otp", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: "Email et code OTP requis.",
    });
  }

  try {
    const student = await Student.findOne({ where: { email } });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Étudiant introuvable.",
      });
    }

    const otp = await Otp.findOne({
      where: {
        student_id: student.id,
        code,
        used: false,
        expires_at: { [Op.gt]: new Date() },
      },
      order: [["createdAt", "DESC"]],
    });

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP invalide ou expiré.",
      });
    }

    otp.used = true;
    await otp.save();

    const token = jwt.sign(
      { studentId: student.id, matricule: student.matricule },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      message: "Connexion réussie.",
      data: {
        token,
        student: {
          id: student.id,
          matricule: student.matricule,
          email: student.email,
          nom: student.nom,
          prenom: student.prenom,
          filiere: student.filiere,
        },
      },
    });
  } catch (error) {
    console.error("Erreur /auth/verify-otp :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la vérification OTP.",
      data: error.message,
    });
  }
});

};
