/**
 * Routes de Seed (Solo desarrollo)
 */

const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seed.controller');

/**
 * POST /api/seed/admin
 * Crear usuario administrador inicial
 * 
 * ⚠️ SOLO DESARROLLO - Eliminar en producción
 */
router.get('/admin', seedController.crearAdminInicial);

module.exports = router;