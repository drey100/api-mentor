// utils/extractToken.js
function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
  
    if (req.cookies?.jwt?.trim()) {
      return req.cookies.jwt;
    }
  
    const queryToken = req.query?.token;
    if (typeof queryToken === 'string' && queryToken.trim().length > 0) {
      console.warn('⚠️ Security Warning: Token transmitted via URL query string');
      return queryToken;
    }
  
    return null;
  }
  
  module.exports = extractToken;
  