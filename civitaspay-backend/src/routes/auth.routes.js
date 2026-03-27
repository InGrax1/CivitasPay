/**
 * Routes de Autenticación
 * Define las rutas del módulo de autenticación
 */

const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/auth.controller');

// Middleware
const { verificarJWT } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/auth/login
 * Login con email y password
 * 
 * Body: { email: string, password: string }
 * Response: { accessToken, refreshToken, usuario }
 */
router.post('/login', loginLimiter, authController.login);

/**
 * POST /api/auth/refresh
 * Renovar access token usando refresh token
 * 
 * Body: { refreshToken: string }
 * Response: { accessToken }
 */
router.post('/refresh', authController.refresh);

/**
 * GET /api/auth/me
 * Obtener datos del usuario autenticado
 * Requiere: JWT válido
 * 
 * Headers: { Authorization: "Bearer <token>" }
 * Response: { usuario }
 */
router.get('/me', verificarJWT, authController.obtenerUsuarioActual);

/**
 * POST /api/auth/logout
 * Cerrar sesión (principalmente para auditoría)
 * Requiere: JWT válido
 * 
 * Headers: { Authorization: "Bearer <token>" }
 */
router.post('/logout', verificarJWT, authController.logout);

module.exports = router;