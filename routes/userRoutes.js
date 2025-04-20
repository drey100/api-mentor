const express = require('express');
const router = express.Router(); // Déclaration unique de router

// Importer les contrôleurs
const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} = require('../controllers/userController');

// Middleware d'authentification
const authMiddleware = require('../middleware/authMiddleware');
// Middleware de validation des données
const { validateUserProfile } = require('../middleware/roleMiddleware');
// Routes
router.get('/profile', authMiddleware, getUserProfile); // Obtenir le profil de l'utilisateur connecté
router.put('/profile', authMiddleware, updateUserProfile); // Mettre à jour le profil
router.delete('/profile', authMiddleware, deleteUserProfile); // Supprimer le compte

module.exports = router; // Exporter le routeur