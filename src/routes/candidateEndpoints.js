const db = require("../db/sequelize");
const { Candidate } = db.models;
const { ValidationError } = require("sequelize");
const auth = require("../auth/auth");

module.exports = (app) => {
  /**
   * =====================================================
   *  POST /api/v1/candidates
   * =====================================================
   *  - Ajoute un nouveau candidat
   */
  app.post("/api/v1/candidates", auth, async (req, res) => {
    const { nom, prenom, matricule, programme, photo_url } = req.body;

    if (!nom || !prenom || !matricule || !programme) {
      return res.status(400).json({
        success: false,
        message:
          "Les champs 'nom', 'prenom', 'matricule' et 'programme' sont requis.",
      });
    }

    try {
      // Vérifier duplicata matricule
      const existing = await Candidate.findOne({ where: { matricule } });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Ce matricule est déjà enregistré pour un candidat.",
        });
      }

      const candidate = await Candidate.create({
        nom,
        prenom,
        matricule,
        programme,
        photo_url,
      });

      res.status(201).json({
        success: true,
        message: "Candidat créé avec succès.",
        data: candidate,
      });
    } catch (error) {
      console.error("Erreur /candidates POST :", error);

      const status = error instanceof ValidationError ? 400 : 500;

      res.status(status).json({
        success: false,
        message:
          status === 400
            ? error.message
            : "Erreur serveur lors de la création du candidat.",
        data: error.message,
      });
    }
  });

  /**
   * =====================================================
   *  GET /api/v1/candidates
   * =====================================================
   *  - Liste complète des candidats
   */
  app.get("/api/v1/candidates", async (req, res) => {
    try {
      const candidates = await Candidate.findAll({
        order: [["nom", "ASC"]],
      });

      res.status(200).json({
        success: true,
        message:
          candidates.length === 0
            ? "Aucun candidat trouvé."
            : "Liste des candidats récupérée avec succès.",
        data: candidates,
      });
    } catch (error) {
      console.error("Erreur /candidates GET :", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des candidats.",
        data: error.message,
      });
    }
  });

  /**
   * =====================================================
   *  GET /api/v1/candidates/:id
   * =====================================================
   *  - Détails d’un candidat
   */
  app.get("/api/v1/candidates/:id", async (req, res) => {
    try {
      const candidate = await Candidate.findByPk(req.params.id);

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidat non trouvé.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Candidat récupéré avec succès.",
        data: candidate,
      });
    } catch (error) {
      console.error("Erreur GET /candidates/:id :", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération du candidat.",
        data: error.message,
      });
    }
  });

  /**
   * =====================================================
   *  PUT /api/v1/candidates/:id
   * =====================================================
   *  - Modifier un candidat
   */
  app.put("/api/v1/candidates/:id", auth, async (req, res) => {
    try {
      const candidate = await Candidate.findByPk(req.params.id);

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidat non trouvé.",
        });
      }

      await candidate.update(req.body);

      res.status(200).json({
        success: true,
        message: "Candidat mis à jour avec succès.",
        data: candidate,
      });
    } catch (error) {
      console.error("Erreur PUT /candidates :", error);

      const status = error instanceof ValidationError ? 400 : 500;

      res.status(status).json({
        success: false,
        message:
          status === 400
            ? error.message
            : "Erreur serveur lors de la mise à jour du candidat.",
        data: error.message,
      });
    }
  });

  /**
   * =====================================================
   *  DELETE /api/v1/candidates/:id
   * =====================================================
   *  - Supprime un candidat
   */
  app.delete("/api/v1/candidates/:id", auth, async (req, res) => {
    try {
      const candidate = await Candidate.findByPk(req.params.id);

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidat non trouvé.",
        });
      }

      await candidate.destroy();

      res.status(200).json({
        success: true,
        message: "Candidat supprimé avec succès.",
      });
    } catch (error) {
      console.error("Erreur DELETE /candidates :", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la suppression du candidat.",
        data: error.message,
      });
    }
  });
};
