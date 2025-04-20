// config/mongo.js
const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI_LOCAL;

async function connectMongo() {
  try {
    await mongoose.connect(mongoURI); // plus besoin de passer les options
    console.log(' Connexion à MongoDB locale réussie !');
  } catch (error) {
    console.error(' Erreur de connexion à MongoDB :', error.message);
  }
}

module.exports = connectMongo;
