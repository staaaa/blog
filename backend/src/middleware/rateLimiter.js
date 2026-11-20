const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for sensitive authentication endpoints (login, register).
 * Max 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Zbyt wiele prób logowania/rejestracji. Spróbuj ponownie za 15 minut.' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Limiter for comments to prevent spam.
 * Max 10 comments per minute per IP.
 */
const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Dodajesz komentarze zbyt szybko. Zwolnij na chwilę.' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Limiter for file uploads to prevent disk exhaustion.
 * Max 30 uploads per 15 minutes per IP.
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Limit przesyłania plików wyczerpany. Spróbuj za chwilę.' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * General API limiter to prevent denial of service.
 * Max 150 requests per minute per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150,
  message: { error: 'Zbyt wiele żądań do API. Spróbuj ponownie za chwilę.' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter,
  commentLimiter,
  uploadLimiter,
  apiLimiter
};
