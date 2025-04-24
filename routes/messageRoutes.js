const express = require('express');
const router = express.Router();
const {
  sendMessage,
  deleteMessage,
  getMessagesByUser,
  getMessagesByMentor,
  getMessageById
} = require('../controllers/messageController');
const { verifyToken, ownerOrAdmin } = require('../middleware/authMiddleware');
const { validateMessage } = require('../middleware/validationMiddleware');

/**
 * @swagger
 * /api/messages:
 *   post:
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     summary: Envoyer un nouveau message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MessageInput'
 *     responses:
 *       201:
 *         description: Message créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.post('/', 
  verifyToken,
  validateMessage,
  sendMessage
);

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     tags: [Messages]
 *     summary: Récupérer un message spécifique
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MessageIdParam'
 *     responses:
 *       200:
 *         description: Détails du message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.get('/:id',
  verifyToken,
  getMessageById
);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     summary: Supprimer un message
 *     parameters:
 *       - $ref: '#/components/parameters/MessageIdParam'
 *     responses:
 *       204:
 *         description: Message supprimé
 */
router.delete('/:id',
  verifyToken,
  ownerOrAdmin,
  deleteMessage
);

/**
 * @swagger
 * /api/messages/user/me:
 *   get:
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     summary: Mes messages (utilisateur)
 *     responses:
 *       200:
 *         description: Liste des messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 */
router.get('/user/me',
  verifyToken,
  getMessagesByUser
);

/**
 * @swagger
 * /api/messages/mentor/me:
 *   get:
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     summary: Mes messages (mentor)
 *     responses:
 *       200:
 *         description: Liste des messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 */
router.get('/mentor/me',
  verifyToken,
  getMessagesByMentor
);

// Ajouter ces nouvelles routes avant module.exports :

/**
 * @swagger
 * /api/messages/{id}/read:
 *   patch:
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     summary: Marquer un message comme lu
 */
router.patch('/:id/read', 
  verifyToken,
  messageController.markAsRead
);

/**
 * @swagger
 * /api/messages/unread:
 *   get:
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     summary: Récupérer les messages non lus
 */
router.get('/unread',
  verifyToken,
  messageController.getUnreadMessages
);

module.exports = router;