const path = require("path");
const fs = require("fs");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

// Configure Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions:
      process.env.DB_SSL && process.env.DB_SSL.toLowerCase() === "true"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    define: {
      underscored: true,
      freezeTableName: false,
      timestamps: true,
    },
  }
);

// loader models
const models = {};
const modelsDir = path.join(__dirname, "models");

fs.readdirSync(modelsDir)
  .filter((file) => file.indexOf(".") !== 0 && file.slice(-3) === ".js")
  .forEach((file) => {
    const modelPath = path.join(modelsDir, file);
    const modelImporter = require(modelPath);
    const model = modelImporter(sequelize, DataTypes);
    models[model.name] = model;
  });

// associations
Object.keys(models).forEach((modelName) => {
  if (typeof models[modelName].associate === "function") {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

/**
 * initDb
 */
const initDb = async (opts = {}) => {
  const defaultOpts = { sync: true, alter: false, force: false };
  const { sync, alter, force } = Object.assign(defaultOpts, opts);

  try {
    await sequelize.authenticate();
    console.log("✅ Database connection OK");

    if (sync) {
      console.log("🔁 Synchronizing models with database...");
      await sequelize.sync({ alter, force });
      console.log("✅ Models synchronized");

      /* -------------------------------------------
       * 🌱 INITIAL DATA SEEDING — INSERT 3 STUDENTS
       * ------------------------------------------- */
      const { Student } = models;

      const existingStudents = await Student.count();

      if (existingStudents === 0) {
        await Student.bulkCreate([
          {
            matricule: "MAT-TEST-0000",
            nom: "KINDA",
            prenom: "Harouna",
            filiere: "RSI",
          },
          {
            matricule: "MAT-TEST-0001",
            nom: "ZOUNGRANA",
            prenom: "Quentin",
            filiere: "EII",
          },
          {
            matricule: "MAT-TEST-0002",
            nom: "ROUAMBA",
            prenom: "Tertus",

            filiere: "RSI",
          },
        ]);

        console.log("🌱 3 étudiants insérés avec succès.");
      } else {
        console.log(
          `ℹ️ ${existingStudents} étudiants déjà présents, seed ignoré.`
        );
      }

      console.log("🌱 Initial data seeding completed.");
    } else {
      console.log("ℹ️ sync skipped (use migrations in production)");
    }


     const { Candidate } = models;

     const candidatesDefault = [
       {
         nom: "OUEDRAOGO",
         prenom: "Salif",
         matricule: "CAND001",
         programme: "Informatique",
         photo_url: "https://via.placeholder.com/150",
       },
       {
         nom: "ZONGO",
         prenom: "Mariam",
         matricule: "CAND002",
         programme: "Gestion",
         photo_url: "https://via.placeholder.com/150",
       },
       {
         nom: "TRAORE",
         prenom: "Idrissa",
         matricule: "CAND003",
         programme: "Droit",
         photo_url: "https://via.placeholder.com/150",
       },
     ];

     // Insérer seulement s’il n’y a aucun candidat
     const existingCandidates = await Candidate.count();
     if (existingCandidates === 0) {
       await Candidate.bulkCreate(candidatesDefault);
       console.log("🌱 3 candidats ajoutés par défaut.");
     }
  } catch (err) {
    console.error("❌ Unable to initialize DB:", err);
    throw err;
  }
};

module.exports = {
  initDb,
  sequelize,
  models,
};
