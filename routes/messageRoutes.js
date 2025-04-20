const express = require('express');
const {
  sendMessage,
  deleteMessage,
  getMessagesByUser,
  getMessagesByMentor,
} = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Envoyer un message (protégé)
router.post('/', authMiddleware, sendMessage);

// Supprimer un message (protégé)
router.delete('/:id', authMiddleware, deleteMessage);

// Obtenir les messages d'un utilisateur (protégé pour l'utilisateur)
router.get('/user', authMiddleware, getMessagesByUser);

// Obtenir les messages d'un mentor (protégé pour le mentor)
router.get('/mentor', authMiddleware, getMessagesByMentor);

module.exports = router;