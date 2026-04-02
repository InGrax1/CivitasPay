/**
 * Controller de Obras
 * Manejo de requests HTTP para endpoints de obras
 */

const obrasService = require('../services/obras.service');
const { crearObraSchema, actualizarObraSchema } = require('../validators/obras.validator');

/**
 * GET /api/obras
 * Listar todas las obras de la empresa del usuario
 */
async function listar(req, res) {
  try {
    const empresaId = req.user.empresa_id;
    
    const resultado = await obrasService.obtenerObras(empresaId);
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en listar obras:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las obras'
    });
  }
}

/**
 * GET /api/obras/:id
 * Obtener detalle de una obra específica
 */
async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    const empresaId = req.user.empresa_id;
    
    const obra = await obrasService.obtenerObraPorId(id, empresaId);
    
    res.json({
      success: true,
      data: obra
    });
  } catch (error) {
    console.error('Error en obtenerPorId:', error.message);
    
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * POST /api/obras
 * Crear una nueva obra
 */
async function crear(req, res) {
  try {
    // Validar con Joi
    const { error, value } = crearObraSchema.validate(req.body, {
      abortEarly: false // Retornar todos los errores, no solo el primero
    });
    
    if (error) {
      const errores = error.details.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Errores de validación',
        detalles: errores
      });
    }
    
    const empresaId = req.user.empresa_id;
    
    const resultado = await obrasService.crearObra(value, empresaId);
    
    res.status(201).json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en crear obra:', error.message);
    
    const statusCode = error.message.includes('porcentajes') || 
                       error.message.includes('retención') ||
                       error.message.includes('monto') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * PUT /api/obras/:id
 * Actualizar una obra existente
 */
async function actualizar(req, res) {
  try {
    const { id } = req.params;
    
    // Validar con Joi
    const { error, value } = actualizarObraSchema.validate(req.body, {
      abortEarly: false
    });
    
    if (error) {
      const errores = error.details.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Errores de validación',
        detalles: errores
      });
    }
    
    const empresaId = req.user.empresa_id;
    
    const resultado = await obrasService.actualizarObra(id, empresaId, value);
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en actualizar obra:', error.message);
    
    let statusCode = 500;
    
    if (error.message.includes('no encontrada')) {
      statusCode = 404;
    } else if (error.message.includes('porcentajes') || 
               error.message.includes('retención') ||
               error.message.includes('monto')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * DELETE /api/obras/:id
 * Eliminar una obra (soft delete)
 */
async function eliminar(req, res) {
  try {
    const { id } = req.params;
    const empresaId = req.user.empresa_id;
    
    const resultado = await obrasService.eliminarObra(id, empresaId);
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error en eliminar obra:', error.message);
    
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
  eliminar
};