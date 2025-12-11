const fs = require("fs");
const csv = require("csv-parser");
const db = require("./src/db/sequelize");
const { Student } = db.models;

const results = [];

fs.createReadStream("etudiants.csv")
  .pipe(csv({ separator: ";" })) // séparateur FR
  .on("data", (data) => {
    // Nettoyage du matricule ici
    const matriculeClean = (data["matricule"] || "")
      .toUpperCase()
      .replace(/O/g, "0"); // Remplace O → 0

    results.push({
      matricule: matriculeClean,
      nom: data["nom"],
      prenom: data["prenom"],
      filiere: data["filiere"],
      email: null, // email restera null jusqu’à l’inscription OTP
    });
  })
  .on("end", async () => {
    console.log(`${results.length} lignes lues.`);

    for (const student of results) {
      try {
        await Student.create(student);
      } catch (e) {
        // On ignore les duplicatas et autres erreurs mineures
      }
    }

    console.log("Import terminé !");
    process.exit();
  });
