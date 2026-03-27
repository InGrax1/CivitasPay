/**
 * Routes de Roles
 * Endpoints relacionados con roles del sistema
 */

const express = require('express');
const router = express.Router();
const rolesService = require('../services/roles.service');
const { verificarJWT } = require('../middleware/auth');
const { soloAdmin } = require('../middleware/rbac');

/**
 * GET /api/roles
 * Listar todos los roles
 * Requiere: JWT válido (cualquier usuario autenticado)
 */
router.get('/', verificarJWT, async (req, res) => {
  try {
    const resultado = await rolesService.obtenerTodosLosRoles();
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/roles/nombre/:nombre
 * Buscar rol por nombre
 * Requiere: JWT válido + Rol ADMINISTRADOR
 */
router.get('/nombre/:nombre', verificarJWT, soloAdmin, async (req, res) => {
  try {
    const { nombre } = req.params;
    const rol = await rolesService.buscarPorNombre(nombre);
    
    if (!rol) {
      return res.status(404).json({
        success: false,
        error: 'Rol no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: rol
    });
  } catch (error) {
    const statusCode = error.message.includes('inválido') || 
                       error.message.includes('requerido') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/roles/verificar-permiso/:nombreRol/:permiso
 * Verificar si un rol tiene un permiso específico
 * Requiere: JWT válido (cualquier usuario)
 */
router.get('/verificar-permiso/:nombreRol/:permiso', verificarJWT, async (req, res) => {
  try {
    const { nombreRol, permiso } = req.params;
    const tienePermiso = await rolesService.tienePermiso(nombreRol, permiso);
    
    res.json({
      success: true,
      rol: nombreRol,
      permiso: permiso,
      tienePermiso: tienePermiso
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;