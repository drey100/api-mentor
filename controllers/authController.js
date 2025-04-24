const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

// Validation Middlewares
const validateRegister = [
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
    .isLength({ min: 8 }).withMessage('Le mot de passe doit faire 8 caractères minimum')
    .matches(/[0-9]/).withMessage('Doit contenir un chiffre')
    .matches(/[a-zA-Z]/).withMessage('Doit contenir une lettre'),
  body('role')
    .optional()
    .isIn(['user', 'mentor', 'admin']).withMessage('Rôle invalide')
];

const validateLogin = [
  body('email')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
];

// Contrôleurs
const authController = {
  register: [
    validateRegister,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { email } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(409).json({ error: 'Email déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const user = new User({ 
          ...req.body, 
          password: hashedPassword,
          role: req.body.role || 'user'
        });
        
        await user.save();

        const token = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        res.status(201).json({ 
          token,
          userId: user._id,
          email: user.email,
          role: user.role,
          expiresIn: 3600,
          message: 'Inscription réussie'
        });
      } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
      }
    }
  ],

  login: [
    validateLogin,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }) || { password: '$2a$10$fakehash...' };
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch || !user._id) {
          return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        res.json({ 
          token,
          userId: user._id,
          email: user.email,
          role: user.role,
          expiresIn: 3600
        });
      } catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
      }
    }
  ],

  logout: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(400).json({ error: "Token manquant" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await TokenBlacklist.create({
        token,
        expiresAt: new Date(decoded.exp * 1000)
      });

      res.status(200).json({ 
        success: true,
        message: "Déconnexion réussie" 
      });
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token invalide' });
      }
      
      res.status(500).json({ error: "Erreur lors de la déconnexion" });
    }
  },

  verifyToken: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Accès refusé - Token manquant' });
      }

      const isBlacklisted = await TokenBlacklist.findOne({ token });
      if (isBlacklisted) {
        return res.status(401).json({ error: 'Session expirée - Veuillez vous reconnecter' });
      }

      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      next();
    } catch (error) {
      console.error('Erreur vérification token:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expirée - Veuillez vous reconnecter' });
      }
      
      res.status(400).json({ error: 'Token invalide' });
    }
  }
};

module.exports = authController;