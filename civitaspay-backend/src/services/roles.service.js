/**
 * Service de Roles
 * Responsabilidad: Lógica de negocio relacionada con roles
 */

const rolesRepository = require('../repositories/roles.repository');

/**
 * Obtener todos los roles con información procesada
 * @returns {Promise<Object>}
 */
async function obtenerTodosLosRoles() {
  try {
    // 1. Obtener datos del repository
    const roles = await rolesRepository.findAll();
    
    // 2. Procesar los datos (lógica de negocio)
    const rolesConPermisos = roles.map(rol => {
      // Parsear el JSON de permisos
      let permisos = [];
      try {
        permisos = JSON.parse(rol.permisos || '[]');
      } catch (e) {
        permisos = [];
      }
      
      return {
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: permisos,  // Array en lugar de string
        totalPermisos: permisos.length,
        esAdministrador: rol.nombre === 'ADMINISTRADOR',
        created_at: rol.created_at
      };
    });
    
    // 3. Devolver resultado procesado
    return {
      total: rolesConPermisos.length,
      roles: rolesConPermisos,
      // Estadísticas adicionales
      stats: {
        conPermisos: rolesConPermisos.filter(r => r.totalPermisos > 0).length,
        sinPermisos: rolesConPermisos.filter(r => r.totalPermisos === 0).length
      }
    };
  } catch (error) {
    console.error('Error en obtenerTodosLosRoles:', error.message);
    throw error;
  }
}

/**
 * Buscar rol por nombre
 * @param {string} nombre - Nombre del rol
 * @returns {Promise<Object|null>}
 */
async function buscarPorNombre(nombre) {
  try {
    // Validación de negocio
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre del rol es requerido');
    }
    
    // Normalizar el nombre (mayúsculas)
    const nombreNormalizado = nombre.toUpperCase().trim();
    
    // Validar que sea un rol válido
    const rolesValidos = ['ADMINISTRADOR', 'AUXILIAR', 'RESIDENTE'];
    if (!rolesValidos.includes(nombreNormalizado)) {
      throw new Error(`Rol inválido. Debe ser uno de: ${rolesValidos.join(', ')}`);
    }
    
    // Obtener del repository
    const rol = await rolesRepository.findByNombre(nombreNormalizado);
    
    if (!rol) {
      return null;
    }
    
    // Procesar permisos
    let permisos = [];
    try {
      permisos = JSON.parse(rol.permisos || '[]');
    } catch (e) {
      permisos = [];
    }
    
    return {
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      permisos: permisos,
      totalPermisos: permisos.length,
      esAdministrador: rol.nombre === 'ADMINISTRADOR'
    };
  } catch (error) {
    console.error('Error en buscarPorNombre:', error.message);
    throw error;
  }
}

/**
 * Verificar si un rol tiene un permiso específico
 * @param {string} nombreRol - Nombre del rol
 * @param {string} permiso - Permiso a verificar
 * @returns {Promise<boolean>}
 */
async function tienePermiso(nombreRol, permiso) {
  try {
    const rol = await buscarPorNombre(nombreRol);
    
    if (!rol) {
      return false;
    }
    
    // Si tiene el permiso "*" (todos), retorna true
    if (rol.permisos.includes('*')) {
      return true;
    }
    
    // Verificar si tiene el permiso específico
    return rol.permisos.includes(permiso);
  } catch (error) {
    console.error('Error en tienePermiso:', error.message);
    return false;
  }
}

// Exportar funciones
module.exports = {
  obtenerTodosLosRoles,
  buscarPorNombre,
  tienePermiso
};