const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { 
  register, 
  login,
  logout,
  verifyToken
} = require('../controllers/authController'); // Importez toutes les fonctions nécessaires

// Middleware de validation centralisé
const validate = validations => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

// Règles de validation
const registerRules = [
  body('firstName')
    .notEmpty().withMessage('Le prénom est requis')
    .trim()
    .escape(),
  body('lastName')
    .notEmpty().withMessage('Le nom est requis')
    .trim()
    .escape(),
  body('email')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('8 caractères minimum')
    .matches(/[0-9]/).withMessage('Doit contenir un chiffre')
    .matches(/[a-zA-Z]/).withMessage('Doit contenir une lettre'),
  body('role')
    .optional()
    .isIn(['user', 'mentor', 'admin']).withMessage('Rôle invalide') // Ajout du rôle mentor
];

const loginRules = [
  body('email')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
];

// Routes
router.post('/register', validate(registerRules), register);
router.post('/login', validate(loginRules), login);
router.post('/logout', verifyToken, logout); // Utilisation directe des fonctions importées

module.exports = router;