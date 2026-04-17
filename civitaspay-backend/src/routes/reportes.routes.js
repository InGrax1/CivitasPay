/**
 * Routes de Reportes
 * Endpoints anidados bajo /api/obras/:obraId
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const reportesController = require('../controllers/reportes.controller');
const { verificarJWT } = require('../middleware/auth');

/**
 * GET /api/obras/:obraId/dashboard
 * Dashboard financiero completo de la obra
 */
router.get('/dashboard', verificarJWT, reportesController.getDashboard);

module.exports = router;