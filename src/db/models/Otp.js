const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const Otp = sequelize.define(
    "Otp",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      student_id: { type: DataTypes.UUID, allowNull: false },
      code: { type: DataTypes.STRING, allowNull: false },
      used: { type: DataTypes.BOOLEAN, defaultValue: false },
      expires_at: { type: DataTypes.DATE, allowNull: false },
    },
    { timestamps: true }
  );
  Otp.associate = (models) => {
    Otp.belongsTo(models.Student, { foreignKey: "student_id", as: "student" });
  };
  return Otp;
};
