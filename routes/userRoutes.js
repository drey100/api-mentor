const express = require('express');
const router = express.Router();

// Import des contrôleurs
const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} = require ('../controllers/userController');

// Middlewares
const auth = require('../middleware/authMiddleware');
const { validateUserProfile } = require('../middleware/validationMiddleware');

// Routes protégées
router.get('/profile', 
  auth.verifyToken,       // Vérification du token JWT
  getUserProfile          // Obtenir le profil utilisateur
);

router.put('/profile',
  auth.verifyToken,       // Vérification du token
  validateUserProfile,    // Validation des données
  updateUserProfile       // Mise à jour du profil
);

router.delete('/profile',
  auth.verifyToken,       // Vérification du token
  deleteUserProfile       // Suppression du compte
);

module.exports = router;