module.exports = (err, req, res, next) => {
  // Définir le statut HTTP par défaut
  const statusCode = err.statusCode || 500;

  // Définir un message d'erreur par défaut
  const message = err.message || 'Internal Server Error';

  // Renvoyer une réponse JSON avec le statut et le message
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Ajoute la stack trace en mode dev
  });

  // Optionnel : Loguer l'erreur pour le débogage
  console.error(err);

  // Gestion spécifique des erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.errors, // Inclut les détails des erreurs de validation
    });
  }

  // Gestion spécifique des erreurs MongoDB (par exemple, ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID',
      details: err.message,
    });
  }
};