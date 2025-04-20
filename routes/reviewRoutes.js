const express = require('express');
const {
  addReview,
  updateReview,
  deleteReview,
  getReviewsByMentor,
} = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Ajouter un avis (protégé pour les utilisateurs)
router.post('/', authMiddleware, addReview);

// Modifier un avis (protégé pour l'utilisateur qui a écrit l'avis)
router.put('/:id', authMiddleware, updateReview);

// Supprimer un avis (protégé pour l'utilisateur qui a écrit l'avis)
router.delete('/:id', authMiddleware, deleteReview);

// Obtenir les avis d'un mentor (accessible à tous)
router.get('/:mentorId', getReviewsByMentor);

module.exports = router;