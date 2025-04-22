// config/cors.js
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5173', // Frontend en développement
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // Si l'origine est dans la liste autorisée ou si la requête est sans origine (par exemple, Postman)
      callback(null, true);
    } else {
      // Rejetter la requête si l'origine n'est pas autorisée
      callback(new Error('CORS policy: Origin not allowed'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);