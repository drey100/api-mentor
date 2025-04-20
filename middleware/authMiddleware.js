const jwt = require('jsonwebtoken');
const User = require('../models/User');


module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Récupère le token du header "Authorization: Bearer <token>"
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifie le token
    req.user = await User.findById(decoded.userId).select('-password'); // Ajoute l'utilisateur à la requête
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};