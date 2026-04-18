/**
 * Routes de Caja Chica
 * Endpoints anidados bajo /api/obras/:obraId/caja-chica
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const cajaChicaController = require('../controllers/caja_chica.controller');
const { verificarJWT } = require('../middleware/auth');
const { soloAdmin } = require('../middleware/rbac');

/**
 * GET /api/obras/:obraId/caja-chica
 * Listar cajas chicas de la obra
 */
router.get('/', verificarJWT, cajaChicaController.listar);

/**
 * GET /api/obras/:obraId/caja-chica/:id
 * Detalle de caja chica con movimientos
 */
router.get('/:id', verificarJWT, cajaChicaController.obtenerPorId);

/**
 * POST /api/obras/:obraId/caja-chica
 * Crear nueva caja chica (solo Admin)
 */
router.post('/', verificarJWT, soloAdmin, cajaChicaController.crear);

/**
 * POST /api/obras/:obraId/caja-chica/:id/reposicion
 * Reponer fondos a la caja
 */
router.post('/:id/reposicion', verificarJWT, cajaChicaController.reponerFondos);

/**
 * POST /api/obras/:obraId/caja-chica/:id/gasto
 * Registrar gasto desde la caja
 */
router.post('/:id/gasto', verificarJWT, cajaChicaController.registrarGasto);

/**
 * POST /api/obras/:obraId/caja-chica/:id/ajuste
 * Registrar ajuste de arqueo (solo Admin)
 */
router.post('/:id/ajuste', verificarJWT, soloAdmin, cajaChicaController.registrarAjuste);

/**
 * PATCH /api/obras/:obraId/caja-chica/:id/toggle
 * Activar / desactivar caja chica (solo Admin)
 */
router.patch('/:id/toggle', verificarJWT, soloAdmin, cajaChicaController.toggleActiva);

module.exports = router;