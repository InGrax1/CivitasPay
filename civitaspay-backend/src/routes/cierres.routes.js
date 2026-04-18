/**
 * Routes de Cierres Mensuales
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const cierresController = require('../controllers/cierres.controller');
const { verificarJWT } = require('../middleware/auth');
const { soloAdmin } = require('../middleware/rbac');

/**
 * GET /api/obras/:obraId/cierres
 * Listar todos los cierres de la obra
 */
router.get('/', verificarJWT, cierresController.listar);

/**
 * GET /api/obras/:obraId/cierres/previsualizar/:periodo
 * Vista previa del cierre antes de ejecutarlo
 * IMPORTANTE: Esta ruta debe ir ANTES de /:id
 */
router.get('/previsualizar/:periodo', verificarJWT, cierresController.previsualizar);

/**
 * GET /api/obras/:obraId/cierres/:id
 * Detalle de un cierre específico
 */
router.get('/:id', verificarJWT, cierresController.obtenerPorId);

/**
 * POST /api/obras/:obraId/cierres
 * Ejecutar cierre mensual (solo Admin)
 */
router.post('/', verificarJWT, soloAdmin, cierresController.ejecutar);

/**
 * PATCH /api/obras/:obraId/cierres/:id/reabrir
 * Reabrir cierre (solo Admin)
 */
router.patch('/:id/reabrir', verificarJWT, soloAdmin, cierresController.reabrir);

module.exports = router;