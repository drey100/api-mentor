const express = require('express');
const router = express.Router();
const {
  addReview,
  updateReview,
  deleteReview,
  getReviewsByMentor,
  getReviewById
} = require('../controllers/reviewController');
const { verifyToken, ownerOrAdmin } = require('../middleware/authMiddleware');
const { validateReview } = require('../middleware/validationMiddleware');

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     summary: Ajouter un avis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       201:
 *         description: Avis créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 */
router.post('/',
  verifyToken,
  validateReview,
  addReview
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     tags: [Reviews]
 *     summary: Récupérer un avis spécifique
 *     parameters:
 *       - $ref: '#/components/parameters/ReviewIdParam'
 *     responses:
 *       200:
 *         description: Détails de l'avis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 */
router.get('/:id',
  getReviewById
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     summary: Modifier un avis
 *     parameters:
 *       - $ref: '#/components/parameters/ReviewIdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       200:
 *         description: Avis mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 */
router.put('/:id',
  verifyToken,
  ownerOrAdmin,
  validateReview,
  updateReview
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     summary: Supprimer un avis
 *     parameters:
 *       - $ref: '#/components/parameters/ReviewIdParam'
 *     responses:
 *       204:
 *         description: Avis supprimé
 */
router.delete('/:id',
  verifyToken,
  ownerOrAdmin,
  deleteReview
);

/**
 * @swagger
 * /api/mentors/{mentorId}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Avis d'un mentor
 *     parameters:
 *       - $ref: '#/components/parameters/MentorIdParam'
 *     responses:
 *       200:
 *         description: Liste des avis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router.get('/mentors/:mentorId/reviews',
  getReviewsByMentor
);

// Ajouter cette nouvelle route avant module.exports :

/**
 * @swagger
 * /api/mentors/{mentorId}/stats:
 *   get:
 *     tags: [Reviews]
 *     summary: Obtenir les statistiques d'un mentor
 */
router.get('/mentors/:mentorId/stats',
  reviewController.getMentorStats
);

module.exports = router;