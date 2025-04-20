const express = require('express');
const {
  getMentors,
  getMentorById,
  createMentorProfile,
  updateMentorProfile,
  deleteMentorProfile,
} = require('../controllers/mentorController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Liste des mentors (accessible à tous)
router.get('/', getMentors);

// Profil détaillé d'un mentor (accessible à tous)
router.get('/:id', getMentorById);

// Créer un profil mentor (protégé pour les mentors uniquement)
router.post('/', authMiddleware, createMentorProfile);

// Mettre à jour un profil mentor (protégé pour le mentor lui-même)
router.put('/:id', authMiddleware, updateMentorProfile);

// Supprimer un profil mentor (protégé pour le mentor lui-même)
router.delete('/:id', authMiddleware, deleteMentorProfile);

module.exports = router;