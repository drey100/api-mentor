const mongoose = require('mongoose');
require('dotenv').config(); // Pour charger les variables d'environnement

const uri = process.env.DB_URI;

async function connectToDatabase() {
  try {
    await mongoose.connect(uri);
    console.log("Connexion à MongoDB avec Mongoose réussie !");
  } catch (err) {
    console.error(" Erreur de connexion à MongoDB :", err.message);
  }
}

module.exports = connectToDatabase;
