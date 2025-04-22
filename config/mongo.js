const mongoose = require('mongoose');

HEAD
const mongoURI = process.env.DB_URI ;

async function connectMongo() {
  try {
    await mongoose.connect(mongoURI); // plus besoin de passer les options
    console.log(' Connexion à MongoDB locale réussie !');
  } catch (error) {
    console.error(' Erreur de connexion à MongoDB :', error.message)};

  };

module.exports = mongoose.model('User', userSchema);