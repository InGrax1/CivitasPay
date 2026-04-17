/**
 * Routes de Gastos
 * Endpoints anidados bajo /api/obras/:obraId/gastos
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const gastosController = require('../controllers/gastos.controller');
const { verificarJWT } = require('../middleware/auth');
const { soloAdmin } = require('../middleware/rbac');

/**
 * GET /api/obras/:obraId/gastos/resumen/categorias
 * IMPORTANTE: Esta ruta debe ir ANTES de /:id
 */
router.get('/resumen/categorias', verificarJWT, gastosController.obtenerResumen);

/**
 * GET /api/obras/:obraId/gastos
 */
router.get('/', verificarJWT, gastosController.listar);

/**
 * GET /api/obras/:obraId/gastos/:id
 */
router.get('/:id', verificarJWT, gastosController.obtenerPorId);

/**
 * POST /api/obras/:obraId/gastos
 */
router.post('/', verificarJWT, gastosController.crear);

/**
 * PUT /api/obras/:obraId/gastos/:id
 */
router.put('/:id', verificarJWT, gastosController.actualizar);

/**
 * DELETE /api/obras/:obraId/gastos/:id
 */
router.delete('/:id', verificarJWT, soloAdmin, gastosController.eliminar);

module.exports = router;