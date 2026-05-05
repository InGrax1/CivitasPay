# CivitasPay

> ERP financiero para empresas constructoras — Control de obras, estimaciones, gastos y distribución automática de ingresos.

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)](https://civitas-pay-d54c.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=node.js)](https://civitaspay-backend.onrender.com)
[![Database](https://img.shields.io/badge/Database-MySQL%208.0-4479A1?style=flat-square&logo=mysql)](https://aiven.io)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## 🌐 Demo

| Servicio | URL |
|---------|-----|
| **Aplicación Web (PWA)** | https://civitas-pay-d54c.vercel.app |
| **API Backend** | https://civitaspay-backend.onrender.com |
| **Health Check** | https://civitaspay-backend.onrender.com/api/health |

> ⚠️ El backend corre en plan gratuito de Render — puede tardar hasta 50 segundos en responder tras un período de inactividad.

---

## ¿Qué es CivitasPay?

CivitasPay es un sistema de gestión financiera diseñado para la industria de la construcción. Su núcleo es un **motor financiero automático** que al registrar una estimación de cobro, calcula y distribuye el dinero a las categorías de gasto de cada obra sin intervención manual.
Cliente paga $200,000
↓
Base (sin IVA): $172,413.79
IVA (16%):       $27,586.21
Retención (5%):   $8,620.69  →  Fondo de Garantía
Costo Directo:  $163,793.10
↓
Materiales (60%):  $98,275.86
Nómina     (30%):  $49,137.93
Herramienta(10%):  $16,379.31


Los porcentajes son configurables por obra.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite 8 + Tailwind CSS 3 |
| Estado | Zustand + TanStack Query |
| Backend | Node.js + Express |
| Base de Datos | MySQL 8.0 (Aiven) |
| Auth | JWT (Access 15min + Refresh 7días) |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |
| PWA | vite-plugin-pwa |
| Tests | Vitest + Testing Library |

---

## Estructura del Proyecto
CivitasPay/
├── civitaspay-backend/     # API REST — Node.js + Express + MySQL
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── validators/
│   ├── scripts/
│   │   └── CivitasPay.sql
│   └── server.js
│
└── civitaspay-frontend/    # PWA — React + Vite
├── src/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── store/
│   ├── test/
│   └── utils/
└── public/


---

## Módulos

| Módulo | Descripción |
|--------|-------------|
| 🔐 Auth | Login JWT, refresh token automático, RBAC por roles |
| 🏗️ Obras | CRUD completo, panel de control financiero por obra |
| 💰 Estimaciones | Flujo BORRADOR→EN_REVISION→APROBADA→COBRADA |
| 💸 Gastos | Registro por categoría, gastos personales, filtros |
| 📊 Dashboard | KPIs financieros, gráficas, alertas |
| 🤝 Contratos | Subcontratos con pagos parciales y seguimiento |
| 💵 Caja Chica | Reposiciones, gauge de liquidez, historial |
| 🔒 Fondo de Garantía | Retenciones acumuladas por obra |
| 👥 Personal | Gestión de usuarios con límite de 5 admins |
| ⚙️ Configuración | IVA, redondeo, moneda, períodos contables |

---

## Roles del Sistema

| Rol | Acceso |
|-----|--------|
| `ADMINISTRADOR` | Acceso total — máximo 5 por empresa |
| `AUXILIAR` | Operación diaria — gastos, estimaciones, contratos |
| `RESIDENTE` | Solo referencia en obras — sin acceso al sistema |

---

## Seguridad
✅ JWT Access Token (15 min) + Refresh Token (7 días)
✅ bcrypt hash de passwords (12 rounds)
✅ Rate Limiting — 5 intentos login / 100 req API por 15 min
✅ Helmet — CSP + X-Frame-Options
✅ RBAC — control de acceso por rol
✅ Prepared Statements — prevención SQL Injection
✅ Multitenancy — datos aislados por empresa
✅ Soft Delete — sin borrado físico de registros


---

## Tests
Test Files  9 passed
Tests       61 passed

Nivel 1 — Utilidades:   formatCurrency, formatDate, financialMath
Nivel 2 — Componentes:  Button, Badge, ConfirmDeleteModal
Nivel 3 — Hooks:        useAuth, useObras, usePersonal


---

## Instalación Local

### Backend

```bash
cd civitaspay-backend
npm install
cp .env.example .env
# Configurar variables en .env
npm run dev
```

### Frontend

```bash
cd civitaspay-frontend
npm install --legacy-peer-deps
npm run dev
```

### Variables de entorno — Backend (`.env`)

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=civitaspay
JWT_SECRET=genera_con_node_-e_crypto.randomBytes(64).toString('hex')
```

### Variables de entorno — Frontend (`.env.development`)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Progreso

| Área | Estado |
|------|--------|
| Backend — 43 endpoints | ✅ Completado |
| Frontend — 11 módulos | ✅ Completado |
| PWA instalable | ✅ Completado |
| Tests — 61 pruebas | ✅ Completado |
| Seguridad | ✅ Completado |
| Deploy producción | ✅ Completado |
| Offline con Dexie | 🔄 Fase 2 |

---

## Licencia

MIT © 2026 CivitasPay