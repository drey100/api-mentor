const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const { verifyToken, checkRole, ownerOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/', mentorController.getMentors);
router.get('/:id', mentorController.getMentorById);

// Protected routes
router.post('/',
  verifyToken,
  checkRole(['mentor', 'admin']),
  mentorController.createMentorProfile
);

router.put('/:id',
  verifyToken,
  ownerOnly,
  mentorController.updateMentorProfile
);

router.delete('/:id',
  verifyToken,
  checkRole(['admin']), // Seul l'admin peut supprimer
  mentorController.deleteMentorProfile
);

module.exports = router;