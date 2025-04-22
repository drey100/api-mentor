const express = require('express');
const cors = require('./config/cors'); // Assurez-vous que le chemin est correct
const connectMongo = require('./config/mongo');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const errorHandler = require('./middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors);  // Utilisation du middleware CORS

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);

// Accueil
app.get('/', (req, res) => {
  res.send('Bienvenue sur mentor API local !');
});

// Gestion des erreurs
app.use(errorHandler);

// Start server *après* connexion MongoDB
async function startServer() {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`Serveur lancé sur le port ${PORT}`);
    });
  } catch (err) {
    console.error('Échec de la connexion MongoDB', err);
    process.exit(1);
  }
}

startServer();
