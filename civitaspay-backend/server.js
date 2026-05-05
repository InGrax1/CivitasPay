// Cargar variables de entorno PRIMERO
require('dotenv').config();

const express = require('express');
const { testConnection, pool } = require('./src/config/database');

//rutas
const authRoutes = require('./src/routes/auth.routes');
const seedRoutes = require('./src/routes/seed.routes');
const rolesRoutes = require('./src/routes/roles.routes');
const obrasRoutes = require('./src/routes/obras.routes');
const estimacionesRoutes = require('./src/routes/estimaciones.routes');
const gastosRoutes = require('./src/routes/gastos.routes');
const reportesRoutes = require('./src/routes/reportes.routes');
const subcontratosRoutes = require('./src/routes/subcontratos.routes');
const cajaChicaRoutes = require('./src/routes/caja_chica.routes');
const fondoGarantiaRoutes = require('./src/routes/fondo_garantia.routes');
const cierresRoutes = require('./src/routes/cierres.routes');
const usuariosAdminRoutes = require('./src/routes/usuarios_admin.routes');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api';


// =====================================================
// SEGURIDAD — Helmet (CSP, X-Frame-Options, etc.)
// =====================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", "data:", "https:"],
      connectSrc:  ["'self'"],
      fontSrc:     ["'self'"],
      objectSrc:   ["'none'"],
      frameSrc:    ["'none'"],
    },
  },
  xFrameOptions: { action: 'deny' },
}));

// =====================================================
// RATE LIMITING
// =====================================================

// Login — máximo 10 intentos por IP cada 15 minutos
const loginLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             10,
  message: {
    success: false,
    error:   'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
  validate:        { xForwardedForHeader: false },
});

// API general — máximo 200 peticiones por IP cada 15 minutos
const apiLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             200,
  message: {
    success: false,
    error:   'Demasiadas peticiones. Intenta de nuevo en unos minutos.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
  validate:        { xForwardedForHeader: false },
});

// Aplicar limiters
app.use(`${API_PREFIX}/auth/login`, loginLimiter);
app.use(API_PREFIX, apiLimiter);

// =====================================================
// CORS — Permite peticiones desde el frontend
// =====================================================
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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
// RUTAS DE PERSONAL (Usuarios de la empresa)
// =====================================================
app.use(`${API_PREFIX}/personal`, usuariosAdminRoutes);

// =====================================================
// RUTAS DE AUTENTICACIÓN
// =====================================================
app.use(`${API_PREFIX}/auth`, authRoutes);

// =====================================================
// RUTAS DE ROLES
// =====================================================
app.use(`${API_PREFIX}/roles`, rolesRoutes);

// =====================================================
// RUTAS DE OBRAS
// =====================================================
app.use(`${API_PREFIX}/obras`, obrasRoutes);

// =====================================================
// RUTAS DE ESTIMACIONES
// =====================================================
const { Router } = require('express');
const obrasRouter = Router();
obrasRouter.use('/:obraId/estimaciones', estimacionesRoutes);
app.use(`${API_PREFIX}/obras`, obrasRouter);

// =====================================================
// RUTAS DE GASTOS
// =====================================================
obrasRouter.use('/:obraId/gastos', gastosRoutes);

// =====================================================
// RUTAS DE SUBCONTRATOS
// =====================================================
obrasRouter.use('/:obraId/subcontratos', subcontratosRoutes); 

// =====================================================
// RUTAS DE CAJA CHICA
// =====================================================
obrasRouter.use('/:obraId/caja-chica', cajaChicaRoutes);

// =====================================================
// RUTAS DE FONDO DE GARANTÍAs
// =====================================================
obrasRouter.use('/:obraId/fondo-garantia', fondoGarantiaRoutes);

// =====================================================
// RUTAS DE CIERRES MENSUALES 
// =====================================================
obrasRouter.use('/:obraId/cierres', cierresRoutes);

// =====================================================
// RUTAS DE REPORTES
// =====================================================
obrasRouter.use('/:obraId', reportesRoutes);

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
    
    console.log(`CivitasPay Backend iniciado`);
    console.log(`Entorno: ${process.env.NODE_ENV}`);
    console.log(`Puerto: ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Auth: http://localhost:${PORT}${API_PREFIX}/auth/login`);
    console.log(`Roles: http://localhost:${PORT}${API_PREFIX}/roles`);
    console.log(`Obras: http://localhost:${PORT}${API_PREFIX}/obras`);
    console.log(`Estimaciones: http://localhost:${PORT}${API_PREFIX}/obras/:obraId/estimaciones`);
    console.log(`Gastos: http://localhost:${PORT}${API_PREFIX}/obras/:obraId/gastos`);
    console.log(`Dashboard: http://localhost:${PORT}${API_PREFIX}/obras/:obraId/dashboard`);
    console.log(`Subcontratos: http://localhost:${PORT}${API_PREFIX}/obras/:obraId/subcontratos`);
    console.log(`Caja Chica:   http://localhost:${PORT}${API_PREFIX}/obras/:obraId/caja-chica`);
    console.log(`Fondo Garantía: http://localhost:${PORT}${API_PREFIX}/obras/:obraId/fondo-garantia`);
    console.log(`Cierres: http://localhost:${PORT}${API_PREFIX}/obras/:obraId/cierres`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });
  } catch (error) {
    console.error('No se pudo iniciar el servidor');
    console.error('   Razón: Error de conexión a MySQL');
    console.error('   Detalle:', error.message);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();