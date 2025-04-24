const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');

// Middleware principal de vérification JWT
exports.verifyToken = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return sendError(res, 401, 'Accès refusé - Token manquant');

  try {
    // Vérifie si le token est blacklisté (déconnecté)
    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      return sendError(res, 401, 'Session expirée - Veuillez vous reconnecter');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    
    if (!req.user) {
      return sendError(res, 404, 'Utilisateur non trouvé');
    }

    next();
  } catch (error) {
    handleTokenError(error, res);
  }
};

// Middleware pour vérifier les rôles
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'Accès refusé - Permissions insuffisantes');
    }
    next();
  };
};

// Middleware spécifique pour les propriétaires
exports.ownerOnly = async (req, res, next) => {
  if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
    return sendError(res, 403, 'Accès refusé - Vous n\'êtes pas propriétaire');
  }
  next();
};

// Helpers
function extractToken(req) {
  return req.headers.authorization?.split(' ')[1] || 
         req.cookies?.jwt || 
         req.query?.token;
}

function sendError(res, code, message) {
  return res.status(code).json({ error: message });
}

function handleTokenError(error, res) {
  console.error('Erreur token:', error.message);
  
  if (error.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Session expirée - Veuillez vous reconnecter');
  }
  
  if (error.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Token invalide');
  }

  sendError(res, 500, 'Erreur serveur');
}