/**
 * Controller de Reportes
 * Manejo de requests HTTP para endpoints de reportes
 */

const reportesService = require('../services/reportes.service');

/**
 * GET /api/obras/:obraId/dashboard
 * Dashboard financiero completo de una obra
 */
async function getDashboard(req, res) {
  try {
    const { obraId } = req.params;
    const empresaId = req.user.empresa_id;

    const dashboard = await reportesService.getDashboardObra(obraId, empresaId);

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Error en getDashboard:', error.message);

    const statusCode = error.message.includes('no encontrada') ||
                       error.message.includes('no pertenece') ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getDashboard
};