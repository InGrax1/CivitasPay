/**
 * Seed Controller (Solo para desarrollo)
 * Crea datos iniciales en la base de datos
 */

const { v4: uuidv4 } = require('uuid');
const authService = require('../services/auth.service');
const usuariosRepository = require('../repositories/usuarios.repository');
const rolesRepository = require('../repositories/roles.repository');
const { pool } = require('../config/database');

/**
 * Crear usuario administrador inicial
 * POST /api/seed/admin
 * 
 * ⚠️ SOLO PARA DESARROLLO - Eliminar en producción
 * ⚠️ SOLO PARA DESARROLLO - Eliminar en producción
 * ⚠️ SOLO PARA DESARROLLO - Eliminar en producción
 * ⚠️ SOLO PARA DESARROLLO - Eliminar en producción
 * ⚠️ SOLO PARA DESARROLLO - Eliminar en producción
 * ⚠️ SOLO PARA DESARROLLO - Eliminar en producción
 */
async function crearAdminInicial(req, res) {
  try {
    // 1. Verificar si ya existe un admin
    const adminExistente = await usuariosRepository.findByEmail('admin@civitaspay.com');
    
    if (adminExistente) {
      return res.status(400).json({
        success: false,
        error: 'El usuario admin ya existe',
        info: 'Email: admin@civitaspay.com'
      });
    }
    
    // 2. Obtener rol de ADMINISTRADOR
    const rolAdmin = await rolesRepository.findByNombre('ADMINISTRADOR');
    
    if (!rolAdmin) {
      return res.status(500).json({
        success: false,
        error: 'Rol ADMINISTRADOR no encontrado. Ejecuta el script SQL primero.'
      });
    }
    
    // 3. Crear empresa por defecto si no existe
    let empresaId;
    const [empresas] = await pool.query('SELECT id FROM empresas LIMIT 1');
    
    if (empresas.length === 0) {
      empresaId = uuidv4();
      await pool.query(`
        INSERT INTO empresas (id, nombre, rfc, direccion)
        VALUES (?, ?, ?, ?)
      `, [empresaId, 'Empresa Demo', 'XXX000000XXX', 'Ciudad de México']);
    } else {
      empresaId = empresas[0].id;
    }
    
    // 4. Hash del password
    const passwordHash = await authService.hashPassword('Admin123!');
    
    // 5. Crear usuario admin
    const adminId = await usuariosRepository.create({
      empresa_id: empresaId,
      rol_id: rolAdmin.id,
      nombre_completo: 'Administrador Sistema',
      email: 'admin@civitaspay.com',
      password_hash: passwordHash,
      telefono: '5512345678',
      activo: true
    });
    
    res.json({
      success: true,
      message: 'Usuario administrador creado exitosamente',
      credenciales: {
        email: 'admin@civitaspay.com',
        password: 'Admin123!',
        nota: '⚠️ Cambia este password inmediatamente'
      },
      usuario: {
        id: adminId,
        nombre_completo: 'Administrador Sistema',
        email: 'admin@civitaspay.com',
        rol: 'ADMINISTRADOR'
      }
    });
  } catch (error) {
    console.error('Error en crearAdminInicial:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear usuario admin',
      detalle: error.message
    });
  }
}

module.exports = {
  crearAdminInicial
};