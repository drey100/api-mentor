// middleware/errorHandler.js

module.exports = (err, req, res, next) => {
    // Définir le statut HTTP par défaut
    const statusCode = err.statusCode || 500;
  
    // Définir un message d'erreur par défaut
    const message = err.message || 'Internal Server Error';
  
    // Renvoyer une réponse JSON avec le statut et le message
    res.status(statusCode).json({
      success: false,
      error: message,
    });
  
    // Optionnel : Loguer l'erreur pour le débogage
    console.error(err);
  };