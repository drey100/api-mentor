const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.PG_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const connectDB = async () => {
  try {
    await client.connect();
    console.log(' Connecté à PostgreSQL via Neon');
  } catch (error) {
    console.error(' Erreur de connexion PostgreSQL :', error.message);
    process.exit(1);
  }
};

module.exports = connectDB; // <= C’est très important cette ligne !

