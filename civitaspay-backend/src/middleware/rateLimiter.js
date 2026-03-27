/**
 * Middleware de Rate Limiting
 * Responsabilidad: Limitar intentos de requests para prevenir ataques
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter para endpoints de autenticación
 * Límite: 5 intentos cada 15 minutos
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos
  message: {
    success: false,
    error: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos',
    codigo: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Devuelve info en headers `RateLimit-*`
  legacyHeaders: false, // Desactiva headers `X-RateLimit-*`
  // Identificar por IP
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});

/**
 * Rate limiter para API general
 * Límite: 100 requests cada 15 minutos
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Demasiados requests. Intenta nuevamente más tarde',
    codigo: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter estricto para operaciones críticas
 * Límite: 10 requests cada hora
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: {
    success: false,
    error: 'Límite de operaciones alcanzado. Intenta en 1 hora',
    codigo: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  loginLimiter,
  apiLimiter,
  strictLimiter
};