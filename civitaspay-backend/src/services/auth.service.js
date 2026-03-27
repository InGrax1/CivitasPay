/**
 * Service de Autenticación
 * Responsabilidad: Lógica de negocio de autenticación (login, JWT, etc.)
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuariosRepository = require('../repositories/usuarios.repository');

// Configuración de seguridad
const BCRYPT_ROUNDS = 12; // Cuanto mayor, más seguro pero más lento
const JWT_EXPIRES_IN = '15m'; // Token de acceso expira en 15 minutos
const JWT_REFRESH_EXPIRES_IN = '7d'; // Refresh token expira en 7 días

/**
 * Login de usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Password en texto plano
 * @param {string} ip - Dirección IP del cliente
 * @returns {Promise<Object>} Token y datos del usuario
 */
async function login(email, password, ip) {
  try {
    // 1. Validar que los campos no estén vacíos
    if (!email || !password) {
      throw new Error('Email y password son requeridos');
    }
    
    // 2. Buscar usuario por email
    const usuario = await usuariosRepository.findByEmail(email);
    
    if (!usuario) {
      // No revelar si el email existe o no (seguridad)
      throw new Error('Credenciales inválidas');
    }
    
    // 3. Verificar que el usuario esté activo
    if (!usuario.activo) {
      throw new Error('Usuario inactivo. Contacta al administrador');
    }
    
    // 4. Comparar password con el hash almacenado
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    
    if (!passwordValido) {
      throw new Error('Credenciales inválidas');
    }
    
    // 5. Actualizar último login e IP
    await usuariosRepository.updateLastLogin(usuario.id, ip);
    
    // 6. Parsear permisos del rol
    let permisos = [];
    try {
      permisos = JSON.parse(usuario.rol_permisos || '[]');
    } catch (e) {
      permisos = [];
    }
    
    // 7. Generar tokens JWT
    const payload = {
      id: usuario.id,
      email: usuario.email,
      empresa_id: usuario.empresa_id,
      rol: usuario.rol_nombre,
      permisos: permisos
    };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
    
    const refreshToken = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
    
    // 8. Devolver respuesta (SIN password_hash)
    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN,
      usuario: {
        id: usuario.id,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        rol: usuario.rol_nombre,
        empresa_id: usuario.empresa_id,
        permisos: permisos
      }
    };
  } catch (error) {
    console.error('Error en login:', error.message);
    throw error;
  }
}

/**
 * Renovar token de acceso usando refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} Nuevo access token
 */
async function refreshAccessToken(refreshToken) {
  try {
    // 1. Verificar que el refresh token sea válido
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // 2. Obtener usuario actualizado
    const usuario = await usuariosRepository.findById(decoded.id);
    
    if (!usuario || !usuario.activo) {
      throw new Error('Usuario no encontrado o inactivo');
    }
    
    // 3. Parsear permisos
    let permisos = [];
    try {
      permisos = JSON.parse(usuario.rol_permisos || '[]');
    } catch (e) {
      permisos = [];
    }
    
    // 4. Generar nuevo access token
    const payload = {
      id: usuario.id,
      email: usuario.email,
      empresa_id: usuario.empresa_id,
      rol: usuario.rol_nombre,
      permisos: permisos
    };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
    
    return {
      accessToken,
      expiresIn: JWT_EXPIRES_IN
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expirado. Inicia sesión nuevamente');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Refresh token inválido');
    }
    throw error;
  }
}

/**
 * Hash de password (para crear usuarios)
 * @param {string} password - Password en texto plano
 * @returns {Promise<string>} Hash del password
 */
async function hashPassword(password) {
  try {
    // Validar fortaleza del password
    if (password.length < 8) {
      throw new Error('El password debe tener al menos 8 caracteres');
    }
    
    // Generar hash con bcrypt
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Error en hashPassword:', error.message);
    throw error;
  }
}

/**
 * Verificar JWT token
 * @param {string} token - JWT token
 * @returns {Object} Payload decodificado
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    }
    throw error;
  }
}

module.exports = {
  login,
  refreshAccessToken,
  hashPassword,
  verifyToken
};