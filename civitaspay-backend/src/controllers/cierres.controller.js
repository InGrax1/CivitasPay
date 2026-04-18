/**
 * Controller de Cierres Mensuales
 */

const cierresService = require('../services/cierres.service');

/**
 * GET /api/obras/:obraId/cierres
 */
async function listar(req, res) {
  try {
    const { obraId } = req.params;
    const empresaId = req.user.empresa_id;

    const resultado = await cierresService.obtenerCierres(obraId, empresaId);

    res.json({ success: true, ...resultado });
  } catch (error) {
    const statusCode = error.message.includes('no encontrada') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/obras/:obraId/cierres/:id
 */
async function obtenerPorId(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;

    const cierre = await cierresService.obtenerCierrePorId(id, obraId, empresaId);

    res.json({ success: true, data: cierre });
  } catch (error) {
    const statusCode = error.message.includes('no encontrado') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/obras/:obraId/cierres/previsualizar/:periodo
 * Ver qué datos quedarán congelados antes de ejecutar el cierre
 */
async function previsualizar(req, res) {
  try {
    const { obraId, periodo } = req.params;
    const empresaId = req.user.empresa_id;

    const resultado = await cierresService.previsualizarCierre(
      obraId, empresaId, periodo
    );

    res.json({ success: true, data: resultado });
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('no encontrada')) statusCode = 404;
    else if (error.message.includes('formato') ||
             error.message.includes('Ya existe')) statusCode = 400;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/obras/:obraId/cierres
 * Ejecutar cierre mensual
 */
async function ejecutar(req, res) {
  try {
    const { obraId } = req.params;
    const empresaId = req.user.empresa_id;
    const usuarioId = req.user.id;
    const { periodo } = req.body;

    if (!periodo) {
      return res.status(400).json({
        success: false,
        error: 'El período es requerido (formato: YYYY-MM)'
      });
    }

    const resultado = await cierresService.ejecutarCierre(
      obraId, empresaId, periodo, usuarioId
    );

    res.status(201).json({ success: true, ...resultado });
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('no encontrada')) statusCode = 404;
    else if (error.message.includes('Ya existe') ||
             error.message.includes('formato')) statusCode = 400;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

/**
 * PATCH /api/obras/:obraId/cierres/:id/reabrir
 * Reabrir cierre (solo Admin, con motivo)
 */
async function reabrir(req, res) {
  try {
    const { obraId, id } = req.params;
    const empresaId = req.user.empresa_id;
    const usuarioId = req.user.id;
    const { motivo } = req.body;

    if (!motivo) {
      return res.status(400).json({
        success: false,
        error: 'El motivo de reapertura es requerido'
      });
    }

    const resultado = await cierresService.reabrirCierre(
      id, obraId, empresaId, usuarioId, motivo
    );

    res.json({ success: true, ...resultado });
  } catch (error) {
    let statusCode = 500;
    if (error.message.includes('no encontrado')) statusCode = 404;
    else if (error.message.includes('ya fue reabierto') ||
             error.message.includes('motivo') ||
             error.message.includes('caracteres')) statusCode = 400;
    res.status(statusCode).json({ success: false, error: error.message });
  }
}

module.exports = {
  listar,
  obtenerPorId,
  previsualizar,
  ejecutar,
  reabrir
};