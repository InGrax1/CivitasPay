/**
 * Routes de Subcontratos
 * Endpoints anidados bajo /api/obras/:obraId/subcontratos
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const subcontratosController = require('../controllers/subcontratos.controller');
const { verificarJWT } = require('../middleware/auth');
const { soloAdmin } = require('../middleware/rbac');

/**
 * GET /api/obras/:obraId/subcontratos
 */
router.get('/', verificarJWT, subcontratosController.listar);

/**
 * GET /api/obras/:obraId/subcontratos/:id
 */
router.get('/:id', verificarJWT, subcontratosController.obtenerPorId);

/**
 * POST /api/obras/:obraId/subcontratos
 */
router.post('/', verificarJWT, subcontratosController.crear);

/**
 * PUT /api/obras/:obraId/subcontratos/:id
 */
router.put('/:id', verificarJWT, subcontratosController.actualizar);

/**
 * PATCH /api/obras/:obraId/subcontratos/:id/estado
 */
router.patch('/:id/estado', verificarJWT, subcontratosController.cambiarEstado);

/**
 * DELETE /api/obras/:obraId/subcontratos/:id
 */
router.delete('/:id', verificarJWT, soloAdmin, subcontratosController.eliminar);

/**
 * POST /api/obras/:obraId/subcontratos/:id/pagos
 * Registrar un pago al subcontrato
 */
router.post('/:id/pagos', verificarJWT, subcontratosController.registrarPago);

module.exports = router;