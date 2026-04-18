/**
 * Routes de Fondo de Garantía
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const fondoGarantiaController = require('../controllers/fondo_garantia.controller');
const { verificarJWT } = require('../middleware/auth');
const { soloAdmin } = require('../middleware/rbac');

/**
 * GET /api/obras/:obraId/fondo-garantia
 * Ver estado del fondo de garantía
 */
router.get('/', verificarJWT, fondoGarantiaController.obtenerFondo);

/**
 * POST /api/obras/:obraId/fondo-garantia/liberar
 * Liberar fondos (solo Admin)
 */
router.post('/liberar', verificarJWT, soloAdmin, fondoGarantiaController.liberarFondo);

module.exports = router;