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
  app.get("/api/v1/votes", auth, async (req, res) => {
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

  /**
   * =====================================================
   *  GET /api/v1/votes/by-matricule/:matricule
   * =====================================================
   *  - Permet à un étudiant de voir pour qui il a voté
   */
  app.get("/api/v1/votes/by-matricule/:matricule", async (req, res) => {
    try {
      const matricule = req.params.matricule.trim().toUpperCase();

      // 1️⃣ Vérifier l'étudiant
      const student = await Student.findOne({
        where: { matricule },
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Étudiant introuvable.",
        });
      }

      // 2️⃣ Vérifier s’il a voté
      const vote = await Vote.findOne({
        where: { student_id: student.id },
        include: [
          {
            model: Candidate,
            as: "candidate",
            attributes: [
              "id",
              "nom",
              "prenom",
              "programme",
              "photo_url",
              "created_at",
            ],
          },
        ],
      });

      // 3️⃣ Aucun vote
      if (!vote) {
        return res.status(200).json({
          success: true,
          voted: false,
          message: "Vous n'avez pas encore voté.",
          data: {
            student: {
              matricule: student.matricule,
              nom: student.nom,
              email: student.email,
              prenom: student.prenom,
              filiere: student.filiere,
            },
          },
        });
      }

      // 4️⃣ Vote trouvé
      return res.status(200).json({
        success: true,
        voted: true,
        message: "Vote trouvé.",
        data: {
          student: {
            matricule: student.matricule,
            nom: student.nom,
            email: student.email,
            prenom: student.prenom,
            filiere: student.filiere,
          },
          vote: {
            candidate: {
              id: vote.candidate.id,
              nom: vote.candidate.nom,
              prenom: vote.candidate.prenom,
              programme: vote.candidate.programme,
              photo_url: vote.candidate.photo_url,
            },
            voted_at: vote.created_at,
          },
        },
      });
    } catch (error) {
      console.error("Erreur /votes/by-matricule :", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur.",
        data: error.message,
      });
    }
  });
};






 