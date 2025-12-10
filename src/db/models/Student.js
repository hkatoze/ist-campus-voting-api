const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const Student = sequelize.define("Student", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    matricule: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: true },
    nom: { type: DataTypes.STRING },
    prenom: { type: DataTypes.STRING },
    filiere: { type: DataTypes.STRING },
    has_voted: { type: DataTypes.BOOLEAN, defaultValue: false },
  });
  Student.associate = (models) => {
    Student.hasOne(models.Vote, { foreignKey: "student_id", as: "vote" });
  };
  return Student;
};
