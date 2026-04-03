/**
 * Controller de Estimaciones
 * Manejo de requests HTTP para endpoints de estimaciones
 */

const estimacionesService = require('../services/estimaciones.service');

/**
 * GET /api/obras/:obraId/estimaciones
 * Listar todas las estimaciones de una obra
 */
async function listar(req, res) {
  try {
    const { obraId } = req.params;
    const empresaId = req.user.empresa_id;
    
    const resultado = await estimacionesService.obtenerEstimaciones(obraId, empresaId);
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en listar estimaciones:', error.message);
    
    const statusCode = error.message.includes('no encontrada') || 
                       error.message.includes('no pertenece') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * GET /api/obras/:obraId/estimaciones/:id
 * Obtener detalle de una estimación
 */
async function obtenerPorId(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;
    
    const estimacion = await estimacionesService.obtenerEstimacionPorId(id, obraId, empresaId);
    
    res.json({
      success: true,
      data: estimacion
    });
  } catch (error) {
    console.error('Error en obtenerPorId (estimaciones):', error.message);
    
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * POST /api/obras/:obraId/estimaciones
 * Crear una nueva estimación
 */
async function crear(req, res) {
  try {
    const { obraId } = req.params;
    const empresaId = req.user.empresa_id;
    const usuarioId = req.user.id;
    
    // Validaciones básicas
    if (!req.body.monto_bruto) {
      return res.status(400).json({
        success: false,
        error: 'El monto_bruto es requerido'
      });
    }
    
    if (!req.body.fecha_estimacion) {
      return res.status(400).json({
        success: false,
        error: 'La fecha_estimacion es requerida'
      });
    }
    
    const resultado = await estimacionesService.crearEstimacion(
      req.body,
      obraId,
      empresaId,
      usuarioId
    );
    
    res.status(201).json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en crear estimación:', error.message);
    
    let statusCode = 500;
    
    if (error.message.includes('no encontrada') || 
        error.message.includes('no pertenece')) {
      statusCode = 404;
    } else if (error.message.includes('debe ser mayor')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * PUT /api/obras/:obraId/estimaciones/:id
 * Actualizar una estimación (solo BORRADOR)
 */
async function actualizar(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;
    
    const resultado = await estimacionesService.actualizarEstimacion(
      id,
      req.body,
      obraId,
      empresaId
    );
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en actualizar estimación:', error.message);
    
    let statusCode = 500;
    
    if (error.message.includes('no encontrada')) {
      statusCode = 404;
    } else if (error.message.includes('No se puede editar') ||
               error.message.includes('debe ser mayor')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * PATCH /api/obras/:obraId/estimaciones/:id/estado
 * Cambiar estado de una estimación
 */
async function cambiarEstado(req, res) {
  try {
    const { obraId, id } = req.params;
    const { estado } = req.body;
    const empresaId = req.user.empresa_id;
    const usuarioId = req.user.id;
    
    if (!estado) {
      return res.status(400).json({
        success: false,
        error: 'El campo "estado" es requerido'
      });
    }
    
    // Validar que el estado sea válido
    const estadosValidos = ['BORRADOR', 'EN_REVISION', 'APROBADA', 'COBRADA'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        error: `Estado inválido. Debe ser: ${estadosValidos.join(', ')}`
      });
    }
    
    const resultado = await estimacionesService.cambiarEstado(
      id,
      estado,
      obraId,
      empresaId,
      usuarioId
    );
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en cambiarEstado:', error.message);
    
    let statusCode = 500;
    
    if (error.message.includes('no encontrada')) {
      statusCode = 404;
    } else if (error.message.includes('No se puede cambiar')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * DELETE /api/obras/:obraId/estimaciones/:id
 * Eliminar estimación (solo BORRADOR)
 */
async function eliminar(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;
    
    const resultado = await estimacionesService.eliminarEstimacion(id, obraId, empresaId);
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en eliminar estimación:', error.message);
    
    let statusCode = 500;
    
    if (error.message.includes('no encontrada')) {
      statusCode = 404;
    } else if (error.message.includes('Solo se pueden eliminar')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  cambiarEstado,
  eliminar
};