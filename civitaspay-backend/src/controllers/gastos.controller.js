/**
 * Controller de Gastos
 * Manejo de requests HTTP para endpoints de gastos
 */

const gastosService = require('../services/gastos.service');

/**
 * GET /api/obras/:obraId/gastos
 * Listar todos los gastos de una obra
 */
async function listar(req, res) {
  try {
    const { obraId } = req.params;
    const empresaId = req.user.empresa_id;
    
    // Filtros opcionales desde query params
    const filtros = {
      categoria_id: req.query.categoria_id,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      is_personal: req.query.is_personal !== undefined ? req.query.is_personal === 'true' : undefined,
      is_caja_chica: req.query.is_caja_chica !== undefined ? req.query.is_caja_chica === 'true' : undefined
    };
    
    const resultado = await gastosService.obtenerGastos(obraId, empresaId, filtros);
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en listar gastos:', error.message);
    
    const statusCode = error.message.includes('no encontrada') || 
                       error.message.includes('no pertenece') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * GET /api/obras/:obraId/gastos/:id
 * Obtener detalle de un gasto
 */
async function obtenerPorId(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;
    
    const gasto = await gastosService.obtenerGastoPorId(id, obraId, empresaId);
    
    res.json({
      success: true,
      data: gasto
    });
  } catch (error) {
    console.error('Error en obtenerPorId (gastos):', error.message);
    
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * POST /api/obras/:obraId/gastos
 * Crear un nuevo gasto
 */
async function crear(req, res) {
  try {
    const { obraId } = req.params;
    const empresaId = req.user.empresa_id;
    const usuarioId = req.user.id;
    
    // Validaciones básicas
    if (!req.body.concepto) {
      return res.status(400).json({
        success: false,
        error: 'El concepto es requerido'
      });
    }
    
    if (!req.body.monto) {
      return res.status(400).json({
        success: false,
        error: 'El monto es requerido'
      });
    }
    
    if (!req.body.fecha_gasto) {
      return res.status(400).json({
        success: false,
        error: 'La fecha (fecha_gasto) es requerida'
      });
    }
    
    const resultado = await gastosService.crearGasto(
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
    console.error('Error en crear gasto:', error.message);
    
    let statusCode = 500;
    
    if (error.message.includes('no encontrada') || 
        error.message.includes('no pertenece')) {
      statusCode = 404;
    } else if (error.message.includes('debe') || 
               error.message.includes('caracteres') ||
               error.message.includes('requerida')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * PUT /api/obras/:obraId/gastos/:id
 * Actualizar un gasto
 */
async function actualizar(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;
    
    const resultado = await gastosService.actualizarGasto(
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
    console.error('Error en actualizar gasto:', error.message);
    
    let statusCode = 500;
    
    if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (error.message.includes('debe')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * DELETE /api/obras/:obraId/gastos/:id
 * Eliminar gasto
 */
async function eliminar(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;
    
    const resultado = await gastosService.eliminarGasto(id, obraId, empresaId);
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en eliminar gasto:', error.message);
    
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * GET /api/obras/:obraId/gastos/resumen/categorias
 * Obtener resumen de gastos por categoría
 */
async function obtenerResumen(req, res) {
  try {
    const { obraId } = req.params;
    const empresaId = req.user.empresa_id;
    
    const resultado = await gastosService.obtenerResumenPorCategoria(obraId, empresaId);
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en obtenerResumen:', error.message);
    
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    
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
  eliminar,
  obtenerResumen
};