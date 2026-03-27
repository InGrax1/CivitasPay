/**
 * Middleware de Autenticación
 * Responsabilidad: Verificar que el usuario tenga un JWT válido
 */

const authService = require('../services/auth.service');

/**
 * Middleware: Verificar JWT
 * Extrae el token del header Authorization y lo valida
 */
function verificarJWT(req, res, next) {
  try {
    // 1. Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }
    
    // 2. Formato esperado: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido. Debe ser: Bearer <token>'
      });
    }
    
    const token = parts[1];
    
    // 3. Verificar y decodificar el token
    const decoded = authService.verifyToken(token);
    
    // 4. Agregar datos del usuario al request (para usar en controllers)
    req.user = decoded;
    
    // 5. Continuar al siguiente middleware o controller
    next();
  } catch (error) {
    // Manejo de errores específicos de JWT
    if (error.message === 'Token expirado') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado',
        codigo: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message === 'Token inválido') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        codigo: 'TOKEN_INVALID'
      });
    }
    
    // Error genérico
    return res.status(401).json({
      success: false,
      error: 'Error de autenticación'
    });
  }
}

/**
 * Middleware: Verificar JWT (Opcional)
 * Si hay token lo valida, pero no es obligatorio
 * Útil para endpoints públicos que cambian comportamiento si estás logueado
 */
function verificarJWTOpcional(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    // Si no hay token, simplemente continuar
    if (!authHeader) {
      req.user = null;
      return next();
    }
    
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      req.user = null;
      return next();
    }
    
    const token = parts[1];
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    
    next();
  } catch (error) {
    // Si el token es inválido, simplemente continuar sin usuario
    req.user = null;
    next();
  }
}

module.exports = {
  verificarJWT,
  verificarJWTOpcional
};