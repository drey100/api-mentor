const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

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
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// 2. Limiteur de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard'
});
app.use('/api', limiter);

// 3. Documentation API
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: "Mentor API Documentation",
    customCss: '.swagger-ui .topbar { display: none }'
  })
);

// 4. Routes
app.use('/api/auth', authRoutes);
// ... autres routes

// 5. Gestion des assets statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'healthy' }));

// 7. Gestion des erreurs
app.use(errorHandler);

// 8. Connexion DB + Lancement serveur
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

startServer();