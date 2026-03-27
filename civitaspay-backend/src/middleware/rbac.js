/**
 * Middleware de RBAC (Role-Based Access Control)
 * Responsabilidad: Verificar permisos basados en roles
 */

/**
 * Middleware: Solo Administrador
 * Verifica que el usuario tenga rol ADMINISTRADOR
 */
function soloAdmin(req, res, next) {
  try {
    // req.user fue agregado por el middleware verificarJWT
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }
    
    if (req.user.rol !== 'ADMINISTRADOR') {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Solo administradores'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error al verificar permisos'
    });
  }
}

/**
 * Middleware: Admin o Auxiliar
 * Permite acceso a ADMINISTRADOR y AUXILIAR (excluye RESIDENTE)
 */
function soloAdminOAuxiliar(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }
    
    const rolesPermitidos = ['ADMINISTRADOR', 'AUXILIAR'];
    
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Se requiere rol Admin o Auxiliar'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error al verificar permisos'
    });
  }
}

/**
 * Middleware: Verificar permiso específico
 * Factory function que crea un middleware para verificar un permiso
 * @param {string} permisoRequerido - Nombre del permiso
 * @returns {Function} Middleware
 */
function requierePermiso(permisoRequerido) {
  return function(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'No autenticado'
        });
      }
      
      const permisos = req.user.permisos || [];
      
      // Si tiene el permiso "*" (todos), permitir acceso
      if (permisos.includes('*')) {
        return next();
      }
      
      // Verificar si tiene el permiso específico
      if (!permisos.includes(permisoRequerido)) {
        return res.status(403).json({
          success: false,
          error: `Acceso denegado. Se requiere permiso: ${permisoRequerido}`
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error al verificar permisos'
      });
    }
  };
}

/**
 * Middleware: Verificar que el usuario pertenece a la empresa
 * Usado para multitenancy - evita que usuarios vean datos de otras empresas
 */
function verificarEmpresa(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }
    
    // Obtener empresa_id del body o query params
    const empresa_id = req.body.empresa_id || req.query.empresa_id || req.params.empresa_id;
    
    if (!empresa_id) {
      // Si no hay empresa_id en el request, continuar
      // (será validado por el controller)
      return next();
    }
    
    // Verificar que coincida con la empresa del usuario
    if (req.user.empresa_id !== empresa_id) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. No tienes acceso a esta empresa'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error al verificar empresa'
    });
  }
}

module.exports = {
  soloAdmin,
  soloAdminOAuxiliar,
  requierePermiso,
  verificarEmpresa
};