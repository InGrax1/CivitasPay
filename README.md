# CivitasPay Backend

> Sistema de gestión financiera para empresas constructoras — Motor de distribución automática de ingresos, control de egresos por categoría y cierre mensual contable.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## ¿Qué es CivitasPay?

CivitasPay es un ERP financiero diseñado específicamente para la industria de la construcción. Su núcleo es un **motor financiero automático** que, al registrar una estimación de cobro, calcula y distribuye el dinero a las categorías de gasto de cada obra sin intervención manual.

```
Cliente paga $200,000
        ↓
  Base (sin IVA): $172,413.79
  IVA:             $27,586.21
  Retención (5%):   $8,620.69  →  Fondo de Garantía
  Costo Directo:  $163,793.10
        ↓
  Materiales (60%):  $98,275.86
  Nómina     (30%):  $49,137.93
  Herramienta(10%):  $16,379.31
```

Los porcentajes de distribución son **configurables por obra**.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js ≥ 18 |
| Framework | Express.js 4.18 |
| Base de Datos | MySQL 8.0 |
| Autenticación | JWT (Access 15min + Refresh 7días) |
| Hash | bcrypt (12 rounds) |
| Validación | Joi |
| Rate Limiting | express-rate-limit |
| IDs | UUID v4 |
| Dev | nodemon |

---

## Arquitectura

El proyecto sigue **Clean Architecture** con separación estricta de responsabilidades:

```
HTTP Request
     ↓
Middleware (JWT · RBAC · Rate Limit)
     ↓
Controller  →  validación de entrada, HTTP codes
     ↓
Service     →  lógica de negocio, reglas financieras
     ↓
Repository  →  queries SQL, prepared statements
     ↓
MySQL 8.0
```

```
civitaspay-backend/
├── src/
│   ├── config/          # Conexión MySQL (pool)
│   ├── controllers/     # Manejo HTTP
│   ├── services/        # Lógica de negocio
│   ├── repositories/    # Queries SQL
│   ├── middleware/       # auth, rbac, rateLimiter
│   ├── routes/          # Definición de endpoints
│   └── validators/      # Esquemas Joi
├── scripts/
│   └── CivitasPay.sql   # Schema completo de BD
├── .env.example
├── server.js
└── package.json
```

---

## Instalación

### Requisitos

- Node.js ≥ 18.0.0
- MySQL 8.0+
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/civitaspay-backend.git
cd civitaspay-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Crear la base de datos
mysql -u root -p < scripts/CivitasPay.sql

# 5. Crear usuario administrador inicial
curl -X POST http://localhost:3000/api/seed/admin

# 6. Iniciar servidor
npm run dev
```

### Variables de Entorno

```env
NODE_ENV=development
PORT=3000
API_PREFIX=/api

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=civitaspay

JWT_SECRET=genera_uno_con_openssl_rand_base64_32

CORS_ORIGIN=http://localhost:4200
```

---

## Módulos y Endpoints

### 🔐 Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login email/password | — |
| POST | `/auth/refresh` | Renovar access token | — |
| GET | `/auth/me` | Perfil del usuario | JWT |
| POST | `/auth/logout` | Cerrar sesión | JWT |

### 🏗️ Obras (`/api/obras`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/obras` | Listar obras de la empresa |
| GET | `/obras/:id` | Detalle de obra |
| POST | `/obras` | Crear obra con config financiera |
| PUT | `/obras/:id` | Actualizar obra |
| DELETE | `/obras/:id` | Eliminar (soft delete · Admin) |

### 💰 Estimaciones (`/api/obras/:obraId/estimaciones`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/estimaciones` | Listar estimaciones |
| GET | `/estimaciones/:id` | Detalle |
| POST | `/estimaciones` | Crear + motor financiero automático |
| PUT | `/estimaciones/:id` | Actualizar (solo BORRADOR) |
| PATCH | `/estimaciones/:id/estado` | Flujo: BORRADOR→EN_REVISION→APROBADA→COBRADA |
| DELETE | `/estimaciones/:id` | Eliminar (solo BORRADOR · Admin) |

### 💸 Gastos (`/api/obras/:obraId/gastos`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/gastos` | Listar con filtros (categoría, fechas) |
| GET | `/gastos/resumen/categorias` | Resumen financiero por categoría |
| GET | `/gastos/:id` | Detalle |
| POST | `/gastos` | Registrar gasto |
| PUT | `/gastos/:id` | Actualizar |
| DELETE | `/gastos/:id` | Eliminar (Admin) |

### 📊 Dashboard (`/api/obras/:obraId/dashboard`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/dashboard` | Resumen financiero completo, indicadores, balance categorías, actividad reciente |

### 🤝 Subcontratos (`/api/obras/:obraId/subcontratos`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/subcontratos` | Listar |
| GET | `/subcontratos/:id` | Detalle con historial de pagos |
| POST | `/subcontratos` | Crear |
| PUT | `/subcontratos/:id` | Actualizar |
| PATCH | `/subcontratos/:id/estado` | ACTIVO · PAUSADO · CANCELADO |
| DELETE | `/subcontratos/:id` | Eliminar (Admin) |
| POST | `/subcontratos/:id/pagos` | Registrar pago parcial/total (liquida automático) |

### 💵 Caja Chica (`/api/obras/:obraId/caja-chica`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/caja-chica` | Listar cajas |
| GET | `/caja-chica/:id` | Detalle + últimos 20 movimientos |
| POST | `/caja-chica` | Crear caja con límite máximo (Admin) |
| POST | `/caja-chica/:id/reposicion` | Reponer fondos |
| POST | `/caja-chica/:id/gasto` | Registrar gasto |
| POST | `/caja-chica/:id/ajuste` | Ajuste de arqueo (Admin) |
| PATCH | `/caja-chica/:id/toggle` | Activar/desactivar (Admin) |

### 🔒 Fondo de Garantía (`/api/obras/:obraId/fondo-garantia`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/fondo-garantia` | Estado del fondo + historial de retenciones |
| POST | `/fondo-garantia/liberar` | Liberar fondos parcial/total (Admin) |

### 📅 Cierres Mensuales (`/api/obras/:obraId/cierres`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/cierres` | Listar cierres |
| GET | `/cierres/previsualizar/:periodo` | Vista previa sin guardar |
| GET | `/cierres/:id` | Detalle del cierre (snapshot congelado) |
| POST | `/cierres` | Ejecutar cierre período YYYY-MM (Admin) |
| PATCH | `/cierres/:id/reabrir` | Reabrir con motivo obligatorio (Admin) |

**Total: 43 endpoints**

---

## Seguridad

```
✅ JWT con access token (15 min) + refresh token (7 días)
✅ Bcrypt hash de passwords (12 rounds)
✅ Rate limiting por IP (5 intentos login / 100 req general)
✅ RBAC — roles: ADMINISTRADOR, AUXILIAR, RESIDENTE
✅ Prepared statements en todas las queries (anti SQL Injection)
✅ Multitenancy — usuarios solo acceden a datos de su empresa
✅ Soft delete — nunca se borra físicamente un registro
✅ IP tracking en cada login
```

---

## Base de Datos

20 tablas cubriendo el ciclo completo de una obra:

```
MAESTRAS          OPERATIVAS              SISTEMA
─────────         ──────────────────      ──────────────────
empresas          obras                   logs_sistema
roles             categorias              sync_conflicts
usuarios          estimaciones            cierres_mensuales
                  gastos                  archivos
                  subcontratos
                  pagos_subcontratos
                  caja_chica
                  caja_chica_movimientos
                  fondo_garantia
                  reembolsos
```

---

## Scripts

```bash
npm run dev      # Desarrollo con hot reload (nodemon)
npm start        # Producción
```

---

## Roles del Sistema

| Rol | Permisos |
|-----|---------|
| `ADMINISTRADOR` | Acceso total — puede crear, editar, eliminar, cerrar y reabrir |
| `AUXILIAR` | Operación diaria — crear gastos, estimaciones, registrar pagos |
| `RESIDENTE` | Solo referencia — aparece en reportes, sin acceso al sistema |

---

## Flujos Principales

### Flujo de Estimación
```
BORRADOR → EN_REVISION → APROBADA → COBRADA
              ↓
           BORRADOR  (puede regresar para corrección)
```

### Flujo de Subcontrato
```
ACTIVO ⟷ PAUSADO → CANCELADO
  ↓
LIQUIDADO  (automático al completar todos los pagos)
```

### Flujo de Cierre Mensual
```
Previsualizar período
       ↓
Ejecutar cierre (snapshot inmutable)
       ↓
Reabrir (solo Admin, motivo obligatorio, una sola vez)
```

---

## Progreso del Proyecto

| Fase | Módulo | Estado |
|------|--------|--------|
| 0 | Setup e infraestructura | ✅ |
| 1 | Autenticación JWT + RBAC | ✅ |
| 2 | Módulo Obras | ✅ |
| 3 | Motor Financiero + Estimaciones | ✅ |
| 4 | Módulo Gastos | ✅ |
| 5 | Reportes y Dashboard | ✅ |
| 6 | Subcontratos | ✅ |
| 7 | Caja Chica | ✅ |
| 8 | Fondo de Garantía | ✅ |
| 9 | Cierres Mensuales | ✅ |

**100% completado — 43 endpoints en producción**

---

## Licencia

MIT © 2026 CivitasPay
