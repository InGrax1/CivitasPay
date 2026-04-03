/**
 * Routes de Estimaciones
 * Endpoints anidados bajo /api/obras/:obraId/estimaciones
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // Importante: mergeParams para acceder a :obraId
const estimacionesController = require('../controllers/estimaciones.controller');
const { verificarJWT } = require('../middleware/auth');
const { soloAdmin } = require('../middleware/rbac');

/**
 * Todas las rutas requieren autenticación JWT
 */

/**
 * GET /api/obras/:obraId/estimaciones
 * Listar todas las estimaciones de una obra
 */
router.get('/', verificarJWT, estimacionesController.listar);

/**
 * GET /api/obras/:obraId/estimaciones/:id
 * Obtener detalle de una estimación
 */
router.get('/:id', verificarJWT, estimacionesController.obtenerPorId);

/**
 * POST /api/obras/:obraId/estimaciones
 * Crear una nueva estimación
 */
router.post('/', verificarJWT, estimacionesController.crear);

/**
 * PUT /api/obras/:obraId/estimaciones/:id
 * Actualizar estimación (solo BORRADOR)
 */
router.put('/:id', verificarJWT, estimacionesController.actualizar);

/**
 * PATCH /api/obras/:obraId/estimaciones/:id/estado
 * Cambiar estado de estimación
 */
router.patch('/:id/estado', verificarJWT, estimacionesController.cambiarEstado);

/**
 * DELETE /api/obras/:obraId/estimaciones/:id
 * Eliminar estimación (solo BORRADOR, solo Admin)
 */
router.delete('/:id', verificarJWT, soloAdmin, estimacionesController.eliminar);

module.exports = router;