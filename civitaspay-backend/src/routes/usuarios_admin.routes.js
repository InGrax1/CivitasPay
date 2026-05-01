const express = require('express');
const router = express.Router();
const usuariosAdminController = require('../controllers/usuarios_admin.controller');
const { verificarJWT } = require('../middleware/auth');
const { soloAdmin } = require('../middleware/rbac');

// Todas las rutas requieren JWT + solo Admin
router.get('/',     verificarJWT, soloAdmin, usuariosAdminController.listar);
router.post('/',    verificarJWT, soloAdmin, usuariosAdminController.crear);
router.put('/:id',  verificarJWT, soloAdmin, usuariosAdminController.actualizar);
router.delete('/:id', verificarJWT, soloAdmin, usuariosAdminController.eliminar);

module.exports = router;