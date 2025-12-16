// src/db/models/VoteWindow.js
module.exports = (sequelize, DataTypes) => {
  const VoteWindow = sequelize.define("VoteWindow", {
    start_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  return VoteWindow;
};
