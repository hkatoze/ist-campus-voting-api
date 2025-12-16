const db = require("../db/sequelize");
const { Student, Candidate, Vote } = db.models;
const { ValidationError } = require("sequelize");
const auth = require("../auth/auth");

module.exports = (app) => {
  /**
   * =====================================================
   *  GET /api/v1/votes
   * =====================================================
   *  - Liste de tous les votes (ADMIN)
   */
  app.get("/api/v1/votes", auth,async (req, res) => {
    try {
      const votes = await Vote.findAll({
        include: [
          {
            model: Student,
            as: "student",
            attributes: ["id", "matricule", "nom", "prenom"],
          },
          {
            model: Candidate,
            as: "candidate",
            attributes: ["id", "nom", "prenom", "programme"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      res.status(200).json({
        success: true,
        message: "Liste des votes récupérée avec succès.",
        data: votes,
      });
    } catch (error) {
      console.error("Erreur /votes GET :", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des votes.",
        data: error.message,
      });
    }
  });
};
