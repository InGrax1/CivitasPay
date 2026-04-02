# CivitasPay Backend - Sistema de Gestión Financiera para Construcción

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MySQL Version](https://img.shields.io/badge/mysql-8.0-blue)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Descripción del Proyecto

CivitasPay es un sistema ERP ligero diseñado específicamente para la industria de la construcción, con capacidades **offline-first** para funcionar en obras remotas sin conectividad a internet. El sistema implementa un motor financiero que automatiza la distribución de ingresos según reglas de negocio predefinidas, garantizando integridad financiera absoluta.

### Características Principales

- **Offline-First Architecture:** Sincronización bidireccional con resolución de conflictos
- **Motor Financiero Automático:** Distribución de ingresos según fórmula maestra (IVA, retenciones, categorías)
- **RBAC (Role-Based Access Control):** Control granular de permisos por rol
- **Multitenancy Lógico:** Múltiples empresas en una sola instancia
- **Auditoría Completa:** Registro inmutable de todas las operaciones
- **Soft Delete:** Eliminación lógica para mantener trazabilidad
- **Seguridad Empresarial:** JWT, bcrypt, rate limiting, IP logging

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

| Capa | Tecnología | Versión | Justificación |
|------|------------|---------|---------------|
| **Runtime** | Node.js | ≥18.0.0 | Asíncrono, non-blocking I/O |
| **Framework** | Express.js | ^4.18.2 | Estándar de la industria, middleware robusto |
| **Base de Datos** | MySQL | 8.0+ | ACID compliance, integridad referencial |
| **Autenticación** | JWT | ^9.0.2 | Stateless, escalable |
| **Hash Passwords** | bcrypt | ^5.1.1 | Resistente a rainbow tables |
| **Rate Limiting** | express-rate-limit | ^7.1.5 | Protección anti-ataques |
| **UUIDs** | uuid | ^9.0.1 | Prevención de colisiones offline |

### Patrón de Arquitectura: Clean Architecture

```
┌─────────────────────────────────────────────┐
│            HTTP Request (Cliente)            │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  MIDDLEWARE LAYER                           │
│  • Rate Limiting                            │
│  • JWT Verification                         │
│  • RBAC (Role-Based Access Control)         │
│  • Request Logging                          │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  CONTROLLER LAYER                           │
│  • Validación de entrada                    │
│  • Extracción de parámetros                 │
│  • Orquestación de Services                 │
│  • Formateo de respuesta HTTP               │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  SERVICE LAYER (Lógica de Negocio)         │
│  • Reglas de negocio                        │
│  • Cálculos financieros                     │
│  • Validaciones complejas                   │
│  • Orquestación de Repositories             │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  REPOSITORY LAYER (Acceso a Datos)         │
│  • Queries SQL (SELECT, INSERT, UPDATE)     │
│  • Prepared Statements                      │
│  • Transacciones                            │
│  • Pool de conexiones                       │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│           MySQL Database (20 tablas)        │
└─────────────────────────────────────────────┘
```

**Principios aplicados:**
- **Separation of Concerns (SoC):** Cada capa tiene una única responsabilidad
- **Dependency Inversion:** Las capas superiores no dependen de implementaciones concretas
- **Single Responsibility:** Cada módulo tiene un único motivo de cambio

---

## 📁 Estructura del Proyecto

```
civitaspay-backend/
├── src/
│   ├── config/
│   │   └── database.js              # Pool de conexiones MySQL
│   ├── controllers/
│   │   ├── auth.controller.js       # Endpoints de autenticación
│   │   └── seed.controller.js       # Datos iniciales (dev only)
│   ├── services/
│   │   ├── auth.service.js          # Lógica de autenticación
│   │   └── roles.service.js         # Lógica de roles y permisos
│   ├── repositories/
│   │   ├── usuarios.repository.js   # Acceso a datos de usuarios
│   │   └── roles.repository.js      # Acceso a datos de roles
│   ├── middleware/
│   │   ├── auth.js                  # Verificación de JWT
│   │   ├── rbac.js                  # Control de acceso por rol
│   │   └── rateLimiter.js           # Límites de requests
│   ├── routes/
│   │   ├── auth.routes.js           # Rutas de autenticación
│   │   └── seed.routes.js           # Rutas de seed (dev only)
│   └── utils/                       # Utilidades compartidas
├── scripts/
│   └── CivitasPay.sql               # Schema de base de datos
├── docs/                            # Documentación adicional
├── tests/                           # Tests unitarios e integración
├── .env.example                     # Template de variables de entorno
├── .gitignore                       # Archivos excluidos de Git
├── package.json                     # Dependencias del proyecto
├── server.js                        # Punto de entrada
└── README.md                        # Este archivo
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js** ≥ 18.0.0 ([Descargar](https://nodejs.org/))
- **MySQL** 8.0+ ([Descargar](https://dev.mysql.com/downloads/mysql/))
- **Git** (para control de versiones)

### Instalación Paso a Paso

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/civitaspay-backend.git
cd civitaspay-backend
```

#### 2. Instalar Dependencias

```bash
npm install
```

**Dependencias instaladas:**
- express (Framework web)
- mysql2 (Driver de MySQL con soporte async/await)
- dotenv (Variables de entorno)
- bcrypt (Hash de passwords)
- jsonwebtoken (JWT)
- express-rate-limit (Rate limiting)
- uuid (Generación de UUIDs)

#### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Editar `.env` con tus valores:

```env
# Servidor
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=civitaspay

# JWT (Cambiar en producción)
JWT_SECRET=tu_clave_secreta_generada_con_openssl

# CORS
CORS_ORIGIN=http://localhost:4200
```

**⚠️ SEGURIDAD:** Nunca subir el archivo `.env` a Git. Está incluido en `.gitignore`.

#### 4. Crear la Base de Datos

```bash
# Opción A: Desde terminal
mysql -u root -p < scripts/CivitasPay.sql

# Opción B: Desde MySQL Workbench
# Abrir scripts/CivitasPay.sql y ejecutar
```

Esto creará:
- Base de datos `civitaspay`
- 20 tablas (empresas, usuarios, roles, obras, etc.)
- Índices optimizados
- Triggers automáticos
- 2 vistas materializadas

#### 5. Iniciar el Servidor

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

**Salida esperada:**

```
🔌 Probando conexión a MySQL...
✅ Conexión a MySQL exitosa
   Query de prueba: OK
   Versión MySQL: 8.0.44
   Base de datos: civitaspay
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 CivitasPay Backend iniciado
📝 Entorno: development
🌐 Puerto: 3000
🔗 URL: http://localhost:3000
💚 Health: http://localhost:3000/health
🔐 Auth: http://localhost:3000/api/auth/login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 6. Crear Usuario Administrador Inicial

**Usando Thunder Client / Postman:**

```http
POST http://localhost:3000/api/seed/admin
```

**Usando curl:**

```bash
curl -X POST http://localhost:3000/api/seed/admin
```

**Respuesta:**

```json
{
  "success": true,
  "credenciales": {
    "email": "admin@civitaspay.com",
    "password": "Admin123!"
  }
}
```

---

## 🔐 Autenticación y Seguridad

### Flujo de Autenticación JWT

```
1. Usuario envía credenciales → POST /api/auth/login
                                  { email, password }
2. Backend verifica con bcrypt ← MySQL (password_hash)
3. Backend genera 2 tokens:
   • Access Token (15 min)  → Para requests normales
   • Refresh Token (7 días) → Para renovar access token
4. Cliente guarda tokens
5. Cada request incluye:   → Authorization: Bearer <token>
6. Middleware verifica JWT
7. Si válido → Continúa
   Si expirado → Error 401
8. Cliente usa refresh token → POST /api/auth/refresh
9. Recibe nuevo access token
```

### Endpoints de Autenticación

| Método | Endpoint | Descripción | Auth Requerida |
|--------|----------|-------------|----------------|
| POST | `/api/auth/login` | Login con email/password | No |
| POST | `/api/auth/refresh` | Renovar access token | No |
| GET | `/api/auth/me` | Datos del usuario actual | Sí (JWT) |
| POST | `/api/auth/logout` | Cerrar sesión (auditoría) | Sí (JWT) |

### Ejemplo de Login

**Request:**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@civitaspay.com",
  "password": "Admin123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login exitoso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m",
  "usuario": {
    "id": "21100a11-e591-4330-9230-2ae20c592509",
    "nombre_completo": "Administrador Sistema",
    "email": "admin@civitaspay.com",
    "rol": "ADMINISTRADOR",
    "permisos": ["*"]
  }
}
```

### Usar el Token en Requests

```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Medidas de Seguridad Implementadas

✅ **Passwords:**
- Hash con bcrypt (12 rounds)
- Nunca almacenados en texto plano
- Validación de fortaleza mínima (8 caracteres)

✅ **JWT:**
- Firmado con HS256
- Expira en 15 minutos (access token)
- Refresh token independiente (7 días)
- Secret almacenado en variable de entorno

✅ **Rate Limiting:**
- Login: 5 intentos cada 15 minutos
- API general: 100 requests cada 15 minutos
- Identificación por IP

✅ **SQL Injection Protection:**
- Prepared statements en todas las queries
- Validación de entrada con Joi (próximamente)

✅ **CORS:**
- Configurado para dominios específicos
- No permite `*` en producción

✅ **Logging:**
- IP tracking en cada login
- Registro de intentos fallidos
- Tabla `logs_sistema` para auditoría

---

## 🎭 Roles y Permisos (RBAC)

### Roles Predefinidos

| Rol | Alcance | Permisos |
|-----|---------|----------|
| **ADMINISTRADOR** | Global | `["*"]` - Todos los permisos |
| **AUXILIAR** | Operativo | `["ver_obras", "crear_gastos", "crear_estimaciones"]` |
| **RESIDENTE** | Referencia | `[]` - Sin login, solo figura en reportes |

### Middleware RBAC

```javascript
// Solo Administrador
app.get('/api/admin/config', verificarJWT, soloAdmin, controller);

// Admin o Auxiliar
app.post('/api/gastos', verificarJWT, soloAdminOAuxiliar, controller);

// Permiso específico
app.delete('/api/obras/:id', verificarJWT, requierePermiso('eliminar_obras'), controller);
```

---

## 🗄️ Base de Datos

### Tablas Principales (20 tablas)

```
MAESTRAS:
├── empresas (Multitenancy)
├── roles (RBAC)
├── usuarios (Autenticación)

OPERATIVAS:
├── obras (Proyectos)
├── categorias (Materiales, Nómina, Herramienta)
├── contratos (Con clientes)
├── estimaciones (Ingresos)
├── gastos (Egresos)
├── subcontratos (Outsourcing)
├── pagos_subcontratos
├── caja_chica
├── caja_chica_movimientos
├── fondo_garantia (Retenciones)
├── reembolsos

SISTEMA:
├── logs_sistema (Auditoría)
├── sync_conflicts (Offline sync)
├── cierres_mensuales (Contabilidad)
├── archivos (PDFs, fotos)

VISTAS:
├── v_resumen_obras
└── v_gastos_por_categoria
```

### Características de la BD

- **UUIDs (CHAR(36)):** Prevención de colisiones en modo offline
- **Soft Delete:** `deleted_at` en lugar de DELETE físico
- **Timestamps:** `created_at`, `updated_at` en todas las tablas
- **Triggers:** Actualización automática de saldos
- **Foreign Keys:** Integridad referencial estricta
- **Índices:** Optimizados para queries frecuentes

### Pool de Conexiones

```javascript
// src/config/database.js
const pool = mysql.createPool({
  connectionLimit: 10,     // Máximo 10 conexiones simultáneas
  waitForConnections: true, // Esperar si no hay disponibles
  queueLimit: 0            // Sin límite de cola
});
```

---

## 📊 Modelo de Datos Clave

### Motor Financiero - Fórmula Maestra

```
Ingreso Bruto (Cliente paga)
    ↓
Monto Base = Bruto / 1.16
    ↓
IVA = Bruto - Base
    ↓
Retención = Base × (% Retención)
    ↓
Costo Directo = Base - Retención
    ↓
Base Repartible = Costo Directo - Total Subcontratos
    ↓
Distribución a Categorías:
    ├─ Materiales = Base Repartible × (% Materiales)
    ├─ Nómina = Base Repartible × (% Nómina)
    └─ Herramienta = Base Repartible × (% Herramienta)
```

**Regla de Oro:** El dinero no se crea ni se destruye, solo se transforma.

---

## 🧪 Testing

### Estructura de Tests

```
tests/
├── unit/               # Tests unitarios (Services, Utils)
├── integration/        # Tests de integración (API)
└── fixtures/           # Datos de prueba
```

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Con coverage
npm test -- --coverage

# Solo unitarios
npm test -- tests/unit

# Solo integración
npm test -- tests/integration

# Modo watch (desarrollo)
npm run test:watch
```

### Cobertura Mínima Requerida

- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

---

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia con nodemon (hot reload)

# Producción
npm start                # Inicia sin hot reload

# Testing
npm test                 # Ejecuta todos los tests
npm run test:watch       # Tests en modo watch
npm run test:integration # Solo tests de integración

# Code Quality
npm run lint             # Revisa código con ESLint
npm run lint:fix         # Fix automático de ESLint
npm run format           # Formatea código con Prettier

# Base de Datos
npm run db:seed          # Crea datos de prueba (dev only)
npm run db:reset         # Reinicia la BD (dev only)
```

---

## 🚀 Deploy en Producción

### Checklist Pre-Deploy

- [ ] Cambiar `NODE_ENV=production` en `.env`
- [ ] Generar nuevo `JWT_SECRET` (openssl rand -base64 32)
- [ ] Configurar SSL/TLS para MySQL
- [ ] Eliminar endpoint `/api/seed/*`
- [ ] Configurar CORS con dominio específico
- [ ] Habilitar logs de producción
- [ ] Configurar backups automáticos de BD
- [ ] Configurar monitoreo (PM2, New Relic, etc.)
- [ ] Revisar límites de rate limiting
- [ ] Configurar variables de entorno en servidor

### Deploy con PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicación
pm2 start server.js --name civitaspay-backend

# Configurar auto-inicio
pm2 startup
pm2 save

# Monitoring
pm2 logs civitaspay-backend
pm2 monit
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MySQL"

```bash
# Verificar que MySQL está corriendo
sudo service mysql status

# Reiniciar MySQL
sudo service mysql restart

# Ver logs de MySQL
sudo tail -f /var/log/mysql/error.log
```

### Error: "Token expirado"

**Solución:** Usar el refresh token para obtener un nuevo access token.

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error: "Rate limit exceeded"

**Causa:** Demasiados intentos de login.  
**Solución:** Esperar 15 minutos o limpiar cache de rate limiter (solo dev).

---
