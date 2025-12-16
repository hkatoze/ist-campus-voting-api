const { ValidationError, UniqueConstraintError } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const db = require("../db/sequelize");
const { Admin, VoteWindow } = db.models;

module.exports = (app) => {
  //S'inscrire
  app.post("/api/v1/adminSignup", async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const admin = await Admin.create({
        emailAddress: req.body.emailAddress,
        nameAndSurname: req.body.nameAndSurname,
        password: hashedPassword,
      });

      const message = `Création de compte administrateur réussie`;
      res.json({ message, data: admin });
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof UniqueConstraintError
      ) {
        return res.status(400).json({ message: error.message });
      }
      const errorMessage = `L'administrateur n'a pas pu être créé. Réessayer dans quelques instants.`;
      res.status(500).json({ message: errorMessage, data: error });
    }
  });

  //Se connecter

  app.post("/api/v1/adminLogin", (req, res) => {
    Admin.findOne({ where: { emailAddress: req.body.emailAddress } })
      .then((admin) => {
        if (!admin) {
          const message = `Ce compte administrateur n'existe pas .Créer un compte ou réessayer une autre adresse email`;
          return res.status(404).json({ message });
        }
        bcrypt
          .compare(req.body.password, admin.password)
          .then((isPasswordValid) => {
            if (!isPasswordValid) {
              const message = `Le mot de passe est incorrect.`;
              return res.status(401).json({ message });
            }
            const token = jwt.sign(
              { userId: admin.id },
              process.env.JWT_SECRET,
              {
                expiresIn: "365d",
              }
            );
            Admin.update({ fcmToken: token }, { where: { id: admin.id } }).then(
              (_) => {
                const message = `Connexion administrateur réussie.`;
                return res.json({ message, data: admin, token });
              }
            );
          });
      })
      .catch((error) => {
        const message = `L'administrateur n'a pas pu se connecter. Reessayer dans quelques instants.`;
        res.status(500).json({ message, data: error });
      });
  });

  /**
   * =====================================================
   *  POST /api/v1/admin/vote-window
   * =====================================================
   *  - Définit l’intervalle de vote
   */
  app.post("/api/v1/admin/vote-window", async (req, res) => {
    const { start_at, end_at } = req.body;

    if (!start_at || !end_at) {
      return res.status(400).json({
        success: false,
        message: "start_at et end_at sont requis.",
      });
    }

    if (new Date(start_at) >= new Date(end_at)) {
      return res.status(400).json({
        success: false,
        message: "La date de début doit être antérieure à la date de fin.",
      });
    }

    try {
      // Désactiver les anciennes fenêtres
      await VoteWindow.update({ active: false }, { where: { active: true } });

      const window = await VoteWindow.create({
        start_at,
        end_at,
        active: true,
      });

      res.status(201).json({
        success: true,
        message: "Intervalle de vote défini avec succès.",
        data: window,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la définition de l’intervalle.",
        data: error.message,
      });
    }
  });

  /**
   * =====================================================
   *  GET /api/v1/vote-window
   * =====================================================
   *  - Récupère la fenêtre active
   */
  app.get("/api/v1/admin/vote-window", async (req, res) => {
    try {
      const window = await VoteWindow.findOne({
        where: { active: true },
        order: [["createdAt", "DESC"]],
      });

      if (!window) {
        return res.status(200).json({
          success: true,
          message: "Aucun intervalle de vote défini.",
          data: null,
        });
      }

      res.status(200).json({
        success: true,
        data: window,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur serveur.",
        data: error.message,
      });
    }
  });
};
