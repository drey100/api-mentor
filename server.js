const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

// Configurations
const corsOptions = require('./config/cors');
const connectMongo = require('./config/mongo');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/authRoutes');
// ... autres routes importées

// Initialisation
const app = express();
const PORT = process.env.PORT || 5000;
const swaggerDocument = require('./swagger.json');

// 1. Middlewares de sécurité
app.use(helmet());
app.use(cors(corsOptions));

// 2. Parsing des données
app.use(express.json({ limit: '10kb' }));

// 3. Nettoyage des entrées utilisateur
app.use((req, res, next) => {
  req.body = req.body || {}; // Assure que req.body est défini
  // Crée une copie de req.query pour éviter les erreurs
  req.params = req.params || {}; // Assure que req.params est défini
  next();
});



app.use(xss());
app.use(hpp());

// 4. Limiteur de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard',
});
app.use('/api', limiter);

// 5. Documentation API
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'Mentor API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  })
);

// 6. Routes
app.use('/api/auth', authRoutes);
// ... autres routes

// 7. Gestion des assets statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 8. Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'healthy' }));

// 9. Gestion des erreurs
app.use(errorHandler);

// 10. Connexion DB + Lancement serveur
async function startServer() {
  try {
    await connectMongo();

    // Seed initial data si nécessaire
    if (process.env.NODE_ENV === 'development') {
      const { seedUsers } = require('./utils/seeder');
      await seedUsers();
    }

    app.listen(PORT, () => {
      console.log(` Serveur en écoute sur le port ${PORT}`);
      console.log(` Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error(' Échec de démarrage:', err.message);
    process.exit(1);
  }
}

app.use('/favicon.ico', (req, res) => res.status(204).end());

startServer();