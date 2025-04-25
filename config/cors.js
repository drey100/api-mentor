const corsOptions = {
  origin: function (origin, callback) {
    // Autorise toutes les origines, y compris les requêtes sans origin (par exemple, Postman ou CURL)
    if (!origin || true) {
      callback(null, true); // Autorise toutes les origines
    } else {
      callback(new Error('CORS policy: Origin not allowed'), false);
    }
  },
  credentials: true, // Autorise les cookies ou les headers d'autorisation
};

module.exports = corsOptions;