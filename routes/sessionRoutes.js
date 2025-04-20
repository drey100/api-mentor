const express = require('express');
const {
  bookSession,
  confirmSession,
  cancelSession,
  getSessionsByUser,
  getSessionsByMentor,
} = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Réserver une session (protégé pour les utilisateurs)
router.post('/book', authMiddleware, bookSession);

// Confirmer une session (protégé pour les mentors)
router.put('/confirm/:id', authMiddleware, confirmSession);

// Annuler une session (protégé pour les utilisateurs ou mentors)
router.delete('/cancel/:id', authMiddleware, cancelSession);

// Obtenir les sessions d'un utilisateur (protégé pour l'utilisateur)
router.get('/user', authMiddleware, getSessionsByUser);

// Obtenir les sessions d'un mentor (protégé pour le mentor)
router.get('/mentor', authMiddleware, getSessionsByMentor);

module.exports = router;