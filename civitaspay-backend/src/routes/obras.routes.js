/**
 * Routes de Obras
 * Endpoints relacionados con gestión de obras (proyectos de construcción)
 */

const express = require('express');
const router = express.Router();
const obrasController = require('../controllers/obras.controller');
const { verificarJWT } = require('../middleware/auth');
const { soloAdmin } = require('../middleware/rbac');

/**
 * Todas las rutas de obras requieren autenticación JWT
 * El middleware verificarJWT se aplica a todas las rutas
 */

/**
 * GET /api/obras
 * Listar todas las obras de la empresa del usuario
 * Requiere: JWT válido
 */
router.get('/', verificarJWT, obrasController.listar);

/**
 * GET /api/obras/:id
 * Obtener detalle de una obra específica
 * Requiere: JWT válido
 */
router.get('/:id', verificarJWT, obrasController.obtenerPorId);

/**
 * POST /api/obras
 * Crear una nueva obra
 * Requiere: JWT válido
 */
router.post('/', verificarJWT, obrasController.crear);

/**
 * PUT /api/obras/:id
 * Actualizar una obra existente
 * Requiere: JWT válido
 */
router.put('/:id', verificarJWT, obrasController.actualizar);

/**
 * DELETE /api/obras/:id
 * Eliminar una obra (soft delete)
 * Requiere: JWT válido + Rol ADMINISTRADOR
 */
router.delete('/:id', verificarJWT, soloAdmin, obrasController.eliminar);

module.exports = router;