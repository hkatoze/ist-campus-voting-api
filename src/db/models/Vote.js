const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const Vote = sequelize.define(
    "Vote",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      student_id: { type: DataTypes.UUID, allowNull: false },
      candidate_id: { type: DataTypes.UUID, allowNull: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { timestamps: false }
  );
 Vote.associate = (models) => {
   Vote.belongsTo(models.Student, { as: "student", foreignKey: "student_id" });
   Vote.belongsTo(models.Candidate, {
     as: "candidate",
     foreignKey: "candidate_id",
   });
 };

  return Vote;
};
