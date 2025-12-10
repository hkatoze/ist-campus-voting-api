const db = require("../db/sequelize");
const { Candidate, Vote, Student } = db.models;

module.exports = (app) => {
  /**
   * =====================================================
   *  GET /api/v1/results
   * =====================================================
   *  - Retourne le classement complet des candidats
   *  - Retourne le gagnant
   */
  app.get("/api/v1/results", async (req, res) => {
    try {
      // Récupérer les candidats triés par nombre de votes (décroissant)
      const candidates = await Candidate.findAll({
        order: [["vote_count", "DESC"]],
      });

      if (!candidates || candidates.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Aucun candidat trouvé.",
          data: {
            candidates: [],
            winner: null,
          },
        });
      }

      // Déterminer le gagnant (le premier du classement)
      const winner = candidates[0];

      return res.status(200).json({
        success: true,
        message: "Résultats récupérés avec succès.",
        data: {
          candidates,
          winner,
        },
      });
    } catch (error) {
      console.error("Erreur /results GET :", error);
      return res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des résultats.",
        data: error.message,
      });
    }
  });

  /**
   * =====================================================
   *  GET /api/v1/results/live
   * =====================================================
   *  - Résultats en direct, classement complet des candidats
   */
  app.get("/api/v1/results/live", async (req, res) => {
    try {
      const candidates = await Candidate.findAll({
        attributes: [
          "id",
          "nom",
          "prenom",
          "programme",
          "photo_url",
          "vote_count",
        ],
        order: [["vote_count", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        message: "Résultats en direct récupérés avec succès.",
        data: candidates,
      });
    } catch (error) {
      console.error("Erreur /results/live :", error);

      return res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des résultats.",
        data: error.message,
      });
    }
  });

  /**
   * =====================================================
   *  GET /api/v1/results/winner
   * =====================================================
   *  - Renvoie uniquement le candidat gagnant
   */
  app.get("/api/v1/results/winner", async (req, res) => {
    try {
      const winner = await Candidate.findOne({
        attributes: [
          "id",
          "nom",
          "prenom",
          "programme",
          "photo_url",
          "vote_count",
        ],
        order: [["vote_count", "DESC"]],
      });

      if (!winner) {
        return res.status(404).json({
          success: false,
          message: "Aucun candidat trouvé.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Gagnant récupéré avec succès.",
        data: winner,
      });
    } catch (error) {
      console.error("Erreur /results/winner :", error);

      return res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération du gagnant.",
        data: error.message,
      });
    }
  });

  /**
   * =====================================================
   *  GET /api/v1/results/stats
   * =====================================================
   *  - Statistiques du vote :
   *    total votes, participation, total candidats, etc.
   */
  app.get("/api/v1/results/stats", async (req, res) => {
    try {
      const totalStudents = await Student.count();
      const totalVotes = await Vote.count();
      const totalCandidates = await Candidate.count();

      const participationRate =
        totalStudents > 0 ? ((totalVotes / totalStudents) * 100).toFixed(2) : 0;

      return res.status(200).json({
        success: true,
        message: "Statistiques récupérées avec succès.",
        data: {
          total_students: totalStudents,
          total_votes: totalVotes,
          total_candidates: totalCandidates,
          participation_rate: participationRate + "%",
        },
      });
    } catch (error) {
      console.error("Erreur /results/stats :", error);

      return res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des statistiques.",
        data: error.message,
      });
    }
  });
};
