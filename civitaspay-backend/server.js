// Cargar variables de entorno PRIMERO
require('dotenv').config();

const express = require('express');
const { testConnection, pool } = require('./src/config/database');
const rolesService = require('./src/services/roles.service');
const authRoutes = require('./src/routes/auth.routes');
const seedRoutes = require('./src/routes/seed.routes');

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api';

// =====================================================
// MIDDLEWARE GLOBALES
// =====================================================

// Body Parser: JSON (MUY IMPORTANTE - debe estar ANTES de las rutas)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// RUTAS
// =====================================================

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '¡Hola! CivitasPay Backend está funcionando 🚀',
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// =====================================================
// RUTAS DE AUTENTICACIÓN
// =====================================================
app.use(`${API_PREFIX}/auth`, authRoutes);

// =====================================================
// RUTAS DE SEED (Solo desarrollo)
// =====================================================
if (process.env.NODE_ENV === 'development') {
  app.use(`${API_PREFIX}/seed`, seedRoutes);
}

// =====================================================
// RUTAS DE UTILIDADES (Temporales)
// =====================================================

// Ver tablas de la BD
app.get(`${API_PREFIX}/tables`, async (req, res) => {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    
    res.json({
      success: true,
      total: tables.length,
      tables: tables.map(t => Object.values(t)[0])
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Listar todos los roles
app.get(`${API_PREFIX}/roles`, async (req, res) => {
  try {
    const resultado = await rolesService.obtenerTodosLosRoles();
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Buscar rol por nombre
app.get(`${API_PREFIX}/roles/nombre/:nombre`, async (req, res) => {
  try {
    const { nombre } = req.params;
    const rol = await rolesService.buscarPorNombre(nombre);
    
    if (!rol) {
      return res.status(404).json({
        success: false,
        error: 'Rol no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: rol
    });
  } catch (error) {
    const statusCode = error.message.includes('inválido') || 
                       error.message.includes('requerido') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

// Verificar permiso
app.get(`${API_PREFIX}/roles/verificar-permiso/:nombreRol/:permiso`, async (req, res) => {
  try {
    const { nombreRol, permiso } = req.params;
    const tienePermiso = await rolesService.tienePermiso(nombreRol, permiso);
    
    res.json({
      success: true,
      rol: nombreRol,
      permiso: permiso,
      tienePermiso: tienePermiso
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// FUNCIÓN PARA INICIAR EL SERVIDOR
// =====================================================

async function startServer() {
  try {
    // 1. Probar conexión a MySQL
    console.log('🔌 Probando conexión a MySQL...');
    await testConnection();
    
    // 2. Iniciar Express
    app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 CivitasPay Backend iniciado`);
      console.log(`📝 Entorno: ${process.env.NODE_ENV}`);
      console.log(`🌐 Puerto: ${PORT}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`💚 Health: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth: http://localhost:${PORT}${API_PREFIX}/auth/login`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor');
    console.error('   Razón: Error de conexión a MySQL');
    console.error('   Detalle:', error.message);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();