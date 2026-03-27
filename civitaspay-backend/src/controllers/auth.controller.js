/**
 * Controller de Autenticación
 * Responsabilidad: Manejar requests HTTP de autenticación
 */

const authService = require('../services/auth.service');
const usuariosRepository = require('../repositories/usuarios.repository');

/**
 * Login de usuario
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    // Validación básica
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y password son requeridos'
      });
    }
    
    // Obtener IP del cliente (para logging)
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Llamar al service
    const resultado = await authService.login(email, password, ip);
    
    // Responder con tokens
    res.json({
      success: true,
      message: 'Login exitoso',
      ...resultado
    });
  } catch (error) {
    // Errores de credenciales inválidas
    if (error.message.includes('Credenciales inválidas') || 
        error.message.includes('inactivo')) {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }
    
    // Error genérico
    console.error('Error en login controller:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar login'
    });
  }
}

/**
 * Renovar access token usando refresh token
 * POST /api/auth/refresh
 */
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token es requerido'
      });
    }
    
    // Renovar token
    const resultado = await authService.refreshAccessToken(refreshToken);
    
    res.json({
      success: true,
      message: 'Token renovado',
      ...resultado
    });
  } catch (error) {
    // Errores de token inválido o expirado
    if (error.message.includes('token')) {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }
    
    console.error('Error en refresh controller:', error);
    res.status(500).json({
      success: false,
      error: 'Error al renovar token'
    });
  }
}

/**
 * Obtener datos del usuario autenticado
 * GET /api/auth/me
 * Requiere: JWT válido (middleware verificarJWT)
 */
async function obtenerUsuarioActual(req, res) {
  try {
    // req.user fue agregado por el middleware verificarJWT
    const usuario = await usuariosRepository.findById(req.user.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    // Parsear permisos
    let permisos = [];
    try {
      permisos = JSON.parse(usuario.rol_permisos || '[]');
    } catch (e) {
      permisos = [];
    }
    
    res.json({
      success: true,
      data: {
        id: usuario.id,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        telefono: usuario.telefono,
        empresa_id: usuario.empresa_id,
        rol: usuario.rol_nombre,
        permisos: permisos,
        activo: usuario.activo,
        ultimo_login: usuario.ultimo_login
      }
    });
  } catch (error) {
    console.error('Error en obtenerUsuarioActual:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario'
    });
  }
}

/**
 * Logout (invalidar token)
 * POST /api/auth/logout
 * 
 * Nota: Con JWT stateless, el logout es del lado del cliente
 * (elimina el token del localStorage/sessionStorage)
 * 
 * Este endpoint es principalmente para logging/auditoría
 */
async function logout(req, res) {
  try {
    // En un sistema stateless JWT, el "logout" real es del lado del cliente
    // Aquí podemos registrar el evento para auditoría
    
    res.json({
      success: true,
      message: 'Logout exitoso. Elimina el token del cliente.'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar logout'
    });
  }
}

module.exports = {
  login,
  refresh,
  obtenerUsuarioActual,
  logout
};