const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const Candidate = sequelize.define("Candidate", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    matricule: { type: DataTypes.STRING, unique: true, allowNull: false },
    nom: { type: DataTypes.STRING, allowNull: false },
    prenom: { type: DataTypes.STRING, allowNull: false },
    programme: { type: DataTypes.TEXT },
    photo_url: { type: DataTypes.STRING, allowNull: true },
    vote_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  });
  Candidate.associate = (models) => {
    Candidate.hasMany(models.Vote, { foreignKey: "candidate_id", as: "votes" });
  };
  return Candidate;
};
