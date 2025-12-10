const db = require("../db/sequelize");
const { Student, Candidate, Vote } = db.models;
const { ValidationError } = require("sequelize");
const auth = require("../auth/auth");

module.exports = (app) => {
  /**
   * =====================================================
   *  POST /api/v1/votes
   * =====================================================
   *  - Enregistre un vote unique pour un étudiant
   */
app.post("/api/v1/votes", auth, async (req, res) => {
  const { candidate_id, student_id } = req.body;

  if (!candidate_id || !student_id) {
    return res.status(400).json({
      success: false,
      message: "Les champs 'student_id' et 'candidate_id' sont requis.",
    });
  }

 
  try {
    // Vérifier l'étudiant
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Étudiant introuvable.",
      });
    }

    // Vérifier le candidat
    const candidate = await Candidate.findByPk(candidate_id);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidat introuvable.",
      });
    }

    // Vérifier si déjà voté
    const existingVote = await Vote.findOne({
      where: { student_id },
    });

    if (existingVote) {
      return res.status(403).json({
        success: false,
        message: "Vous avez déjà voté.",
      });
    }

    // Enregistrer le vote
    const vote = await Vote.create({
      student_id,
      candidate_id,
    });

    // Incrémenter le candidat
    candidate.vote_count += 1;
    await candidate.save();

    return res.status(201).json({
      success: true,
      message: "Vote enregistré avec succès.",
      data: vote,
    });
  } catch (error) {
    console.error("Erreur /votes POST :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
      data: error.message,
    });
  }
});


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
