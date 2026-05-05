# Changelog — CivitasPay Frontend

Todos los cambios notables en este proyecto serán documentados en este archivo.

---

## Estado Actual del Proyecto

| Métrica | Valor |
|---------|-------|
| **Versión** | 0.14.0 |
| **Progreso General** | 95% |
| **Páginas implementadas** | 11 / 11 |
| **Módulos conectados al backend** | 10 |
| **PWA** | ✅ Completado |
| **Tests** | ✅ 61 tests — 0 fallos |
| **Roles en sidebar** | ✅ Completado |
| **Offline / Dexie** | Pendiente (a confirmacion de cliente) |
| **Deploy** | Pendiente |
```

---
## [0.15.0] — Deploy a Producción

### 🚀 Infraestructura

#### Frontend — Vercel
- Deploy automático desde GitHub rama `main`
- Root Directory: `civitaspay-frontend`
- Build Command: `npm install --legacy-peer-deps && npm run build`
- Install Command: `npm install --legacy-peer-deps`
- Framework detectado automáticamente: Vite
- PWA instalable desde la URL de producción

#### Variables de Entorno
- `.env.production` — URL del backend en Render
- `.env.development` — URL del backend local
- `VITE_API_URL` inyectada en build via `import.meta.env`

### 🔧 Archivos Creados
.env.production          — VITE_API_URL apuntando a Render
.env.development         — VITE_API_URL apuntando a localhost
.npmrc                   — legacy-peer-deps=true para Vercel
vercel.json              — buildCommand + rewrites para SPA


### 🔧 Archivos Modificados
src/api/axios.config.js — baseURL usa import.meta.env.VITE_API_URL


### 🌐 URLs de Producción
App (PWA): https://civitas-pay-d54c.vercel.app Login: https://civitas-pay-d54c.vercel.app/login


---
Y actualiza el bloque de estado al inicio:

## Estado Actual del Proyecto

| Métrica | Valor |
|---------|-------|
| **Versión** | 0.15.0 |
| **Progreso General** | 100% |
| **Páginas implementadas** | 11 / 11 |
| **Módulos conectados al backend** | 10 |
| **PWA** | ✅ Instalable en producción |
| **Tests** | ✅ 61 tests — 0 fallos |
| **Roles en sidebar** | ✅ Completado |
| **Seguridad** | ✅ Helmet + Rate Limiting |
| **Deploy** | ✅ Vercel + Render + Aiven |
| **Offline / Dexie** | 🔄 Fase 2 |


```
## [0.14.0] — Roles en Sidebar y Protección de Rutas

### ✨ Features Añadidas

#### Sidebar dinámico por rol
- Menú filtrado según el rol del usuario autenticado
- Administrador: ve todos los módulos
- Auxiliar: ve Menú, Obras, Contratos, Finanzas — sin Personal ni Config
- Residente: redirige automáticamente a `/sin-acceso`
- Rol del usuario visible debajo del logo en el sidebar

#### Protección de rutas
- `ProtectedRoute` actualizado: redirige Residentes a `/sin-acceso`
- `SoloAdmin`: componente que protege rutas exclusivas de Admin
- Rutas `/personal` y `/config` protegidas con `SoloAdmin`
- Página `/sin-acceso` con botón de cerrar sesión

### 🔧 Archivos Modificados
```
src/components/layout/Sidebar.jsx — navItems dinámicos por rol
src/App.jsx — SoloAdmin + ProtectedRoute actualizado + ruta /sin-acceso
```

---

```
## [0.13.0] — Tests con Vitest

### ✨ Tests Implementados

#### Nivel 1 — Utilidades (25 tests)
- `formatCurrency` — 8 tests: enteros, decimales, cero, negativos, símbolo
- `formatDate` — 8 tests: fechas válidas, nulos, undefined, formato YYYY-MM-DD
- `financialMath` — 9 tests: IVA, base, distribución por categoría, costo directo

#### Nivel 2 — Componentes UI (21 tests)
- `Button` — 8 tests: variants, loading, disabled, onClick, type submit
- `Badge` — 6 tests: estados ACTIVA, PAUSADA, TERMINADA, BORRADOR, APROBADA, desconocido
- `ConfirmDeleteModal` — 7 tests: título, nombre, botón deshabilitado, validación exacta, onConfirm, onClose

#### Nivel 3 — Hooks (15 tests)
- `useAuth` — 5 tests: estado inicial, login, logout, rol guardado
- `useObras` — 5 tests: lista real, array vacío, error de red, dashboard, query deshabilitada sin obraId
- `usePersonal` — 5 tests: lista usuarios, filtro admins, filtro residentes, límite 5 admins, error

### 📊 Resultado Final
```
Test Files  9 passed (9)
Tests       61 passed (61)
```

### 🔧 Archivos Creados
```
src/test/setup.js
src/test/utils/formatCurrency.test.js
src/test/utils/formatDate.test.js
src/test/utils/financialMath.test.js
src/test/components/Button.test.jsx
src/test/components/Badge.test.jsx
src/test/components/ConfirmDeleteModal.test.jsx
src/test/hooks/useAuth.test.jsx
src/test/hooks/useObras.test.jsx
src/test/hooks/usePersonal.test.jsx
src/utils/formatDate.js
src/utils/financialMath.js
```

### 📦 Dependencias Añadidas
```
vitest
@testing-library/react
@testing-library/jest-dom
@testing-library/user-event
@testing-library/dom
jsdom
```

### ⚙️ Scripts Añadidos
```
"test":     "vitest"
"test:run": "vitest run"
"test:ui":  "vitest --ui"
"coverage": "vitest run --coverage"
```
```

```
## [0.12.0] — PWA

### ✨ Features Añadidas
- Íconos generados automáticamente desde `public/logo.svg` con `@vite-pwa/assets-generator`
- App instalable en desktop (Chrome) y móvil
- Service Worker con estrategia **NetworkFirst** para `/api/*`
- Service Worker con estrategia **CacheFirst** para assets estáticos
- Manifest configurado: nombre, descripción, colores, display standalone, orientación portrait

### 📁 Archivos Generados en `public/`
```
pwa-64x64.png
pwa-192x192.png
pwa-512x512.png
maskable-icon-512x512.png
apple-touch-icon-180x180.png
favicon.ico
```

### 🔧 Archivos Modificados
```
vite.config.js       — VitePWA plugin con manifest y workbox
index.html           — meta theme-color + links de íconos PWA
pwa-assets.config.js — configuración del generador de íconos
```

### 📦 Dependencias Añadidas
```
@vite-pwa/assets-generator (dev) — generador de íconos desde SVG
```

---

## [0.11.0] — Configuración

### ✨ Features Añadidas

#### ConfigPage
- **Sección 1 — Configuración Fiscal:**
  - IVA configurable (default 16%) con preview en tiempo real
  - Ejemplo automático: $100,000 bruto → Base + IVA calculados dinámicamente
  - Redondeo financiero: 0, 2, 4 o 6 decimales
  - Selector de moneda: MXN, USD, EUR
- **Sección 2 — Períodos Contables:**
  - Tipo de período: Semanal, Quincenal, Mensual, Personalizado
  - Semanal: selector del día de inicio (Lunes–Domingo)
  - Quincenal: días de corte configurables (ej: 1 y 16)
  - Personalizado: número de días por período
  - Preview del período actual y siguiente en tiempo real
  - Sin restricción de mes — una semana del lun 28 al dom 4 es válida aunque cruce dos meses
- Guardar en `localStorage` con clave `civitaspay-config`
- Botón "Restaurar" regresa a valores por defecto

### 🔧 Archivos Creados
```
src/pages/ConfigPage.jsx
```

---

## [0.10.0] — Módulo Personal

### ✨ Features Añadidas

#### PersonalPage (solo visible para Administradores)
- 3 KPI Cards: Administradores (X/5), Auxiliares, Residentes
- Tabla con: avatar, nombre, email, rol (ícono + color), teléfono, último acceso, estado
- El Admin no puede eliminarse a sí mismo

#### UsuarioForm (Modal)
- Crear y Editar en el mismo componente
- Campos: Nombre, Email, Teléfono, Rol, Contraseña
- Si el rol es **RESIDENTE**: campo de contraseña desaparece automáticamente + aviso informativo
- Si es edición: contraseña opcional + toggle de estado Activo/Inactivo

#### Reglas de negocio
- ADMINISTRADOR: máximo 5 por empresa (validado en backend y mostrado en frontend)
- AUXILIAR: sin límite, requiere contraseña mínimo 8 caracteres
- RESIDENTE: sin límite, sin acceso al sistema — solo figura de referencia en obras

### 🔧 Archivos Creados
```
src/api/personal.api.js
src/hooks/usePersonal.js
src/pages/PersonalPage.jsx
```

### 📊 Endpoints Consumidos
```
GET    /api/personal
POST   /api/personal
PUT    /api/personal/:id
DELETE /api/personal/:id
```

---

## [0.9.0] — Fondo de Garantía en Panel de Obra

### ✨ Features Añadidas
- Tarjeta de Fondo de Garantía en la columna derecha de `ObrasPage`
- Muestra: Saldo Acumulado, % de Retención, Estimaciones aprobadas
- Aviso "Solo lectura — liberación disponible en Fase 2"

### 🔧 Archivos Creados
```
src/api/fondoGarantia.api.js
src/hooks/useFondoGarantia.js
```

### 📊 Endpoints Consumidos
```
GET /api/obras/:obraId/fondo-garantia
```

---

## [0.8.0] — Eliminar Obra con Confirmación

### ✨ Features Añadidas

#### ObraCard — Botón Eliminar
- Botón de eliminar aparece en hover sobre la ObraCard (solo Admin)
- No navega a la obra — `e.stopPropagation()` aislado

#### ConfirmDeleteModal (reutilizable)
- Modal con ícono de advertencia y texto de impacto
- El usuario debe escribir el nombre exacto de la obra para habilitar el botón
- Reutilizado también en Módulo Personal

### 🔧 Archivos Creados
```
src/components/ui/ConfirmDeleteModal.jsx
```

### 🔧 Archivos Modificados
```
src/components/obras/ObraCard.jsx — botón eliminar + hover + modal
```

---

## [0.7.0] — Módulo Contratos

### ✨ Features Añadidas

#### ContratosPage
- 3 KPI Cards: Total Contratado, Total Pagado, Total Pendiente
- Grid responsive de `ContratoCard`
- Botones pausar/reactivar contrato

#### ContratoCard
- Borde de color según estado: verde/amarillo/gris/rojo
- Montos Contratado y Pagado
- Barra de progreso con porcentaje de ejecución
- Fechas inicio → fin

#### Modales
- Nuevo Contrato: Proveedor, Monto, Fechas, Concepto, Notas
- Registrar Pago: Monto, Fecha, Método (Transferencia/Cheque/Efectivo/Otro)

### 🔧 Archivos Creados
```
src/api/contratos.api.js
src/hooks/useContratos.js
src/components/contratos/ContratoCard.jsx
src/pages/ContratosPage.jsx
```

### 📊 Endpoints Consumidos
```
GET    /api/obras/:obraId/subcontratos
POST   /api/obras/:obraId/subcontratos
POST   /api/obras/:obraId/subcontratos/:id/pagos
PATCH  /api/obras/:obraId/subcontratos/:id/estado
```

---

## [0.6.0] — Módulo Gasto Personal

### ✨ Features Añadidas

#### GastoPersonalPage
- 3 KPI Cards: Total Gastado, Total Mensual, Categoría con más gastos
- Tabla filtrada por `is_personal: true`
- Donut chart de distribución por categoría
- Al abrir GastoForm: toggle "Gasto Personal" activado por defecto

### 🔧 Archivos Creados
```
src/pages/GastoPersonalPage.jsx
```

### 📊 Endpoints Consumidos
```
GET /api/obras/:obraId/gastos?is_personal=true
GET /api/obras/:obraId/gastos/resumen/categorias
```

---

## [0.5.0] — Módulo Caja Chica

### ✨ Features Añadidas

#### CajaChicaPage
- KPI principal: Liquidez Total + Entrada/Salida mensual
- Gauge semicircular SVG con color dinámico (verde/amarillo/rojo)
- AreaChart de flujo semanal con series Entrada/Salida
- Historial de movimientos con badge de estado
- Si no hay caja: botón "Crear Caja Chica" (solo Admin)

#### Modales
- Reponer Fondos: monto + concepto
- Registrar Gasto de Caja: monto + concepto
- Crear Caja: nombre + límite máximo

### 🔧 Archivos Creados
```
src/api/cajaChica.api.js
src/hooks/useCajaChica.js
src/pages/CajaChicaPage.jsx
```

### 📊 Endpoints Consumidos
```
GET  /api/obras/:obraId/caja-chica
GET  /api/obras/:obraId/caja-chica/:id
POST /api/obras/:obraId/caja-chica
POST /api/obras/:obraId/caja-chica/:id/reposicion
POST /api/obras/:obraId/caja-chica/:id/gasto
```

---

## [0.4.0] — Módulo Estimaciones

### ✨ Features Añadidas

#### EstimacionesPage
- 2 KPI Cards: Ingresos Totales Cobrados + Saldo Pendiente
- Tabla con flujo de estados y botones RBAC

#### Flujo de estados
- Auxiliar: "Enviar a Revisión" (BORRADOR → EN_REVISION)
- Admin: "Aprobar" (EN_REVISION → APROBADA)
- Admin: "Marcar Cobrada" (APROBADA → COBRADA)
- Solo Admin elimina estimaciones en BORRADOR

#### EstimacionForm
- Motor Financiero Preview en tiempo real al escribir el monto
- Calcula: Base, IVA, Retención, distribución por categoría

### 🔧 Archivos Creados
```
src/api/estimaciones.api.js
src/hooks/useEstimaciones.js
src/components/estimaciones/EstimacionForm.jsx
src/pages/EstimacionesPage.jsx
```

### 📊 Endpoints Consumidos
```
GET    /api/obras/:obraId/estimaciones
POST   /api/obras/:obraId/estimaciones
PATCH  /api/obras/:obraId/estimaciones/:id/estado
DELETE /api/obras/:obraId/estimaciones/:id
```

---

## [0.3.0] — Módulo Gastos

### ✨ Features Añadidas

#### GastosPage
- Filtros por tabs: Todos / MATERIALES / NOMINA / HERRAMIENTA / Personal
- Selector de rango de fechas con accesos rápidos
- Tabla con badge de categoría por color
- Panel "Sumatoria Mensual" con desglose por categoría

#### GastoForm
- Categoría, Monto, Fecha, Proveedor, Concepto
- Toggle "Gasto Personal" con aviso de advertencia
- Prop `personalPorDefecto` para GastoPersonalPage

### 🔧 Archivos Creados
```
src/api/gastos.api.js
src/hooks/useGastos.js
src/components/gastos/GastoForm.jsx
src/pages/GastosPage.jsx
```

### 📊 Endpoints Consumidos
```
GET    /api/obras/:obraId/gastos
GET    /api/obras/:obraId/gastos/resumen/categorias
POST   /api/obras/:obraId/gastos
DELETE /api/obras/:obraId/gastos/:id
```

---

## [0.2.0] — Dashboard + Panel de Obra

### ✨ Features Añadidas

#### DashboardPage
- 4 KPI Cards con datos reales del backend
- Grid responsive de ObraCard
- Gráfica de líneas y donut chart
- Botones de acción rápida: Nueva Obra, Registrar Gasto, Estimación, Contrato

#### ObrasPage (Panel de control)
- 4 KPI Cards financieras con datos reales
- Gráfica de distribución de costos
- Tabla de estimaciones recientes
- Columna derecha: Alertas, Transacciones, Ubicación, Residente, Fondo de Garantía

#### ObraCard
- Gradiente con inicial si no hay foto
- Badge de estado con color dinámico
- Barra de progreso con color según porcentaje

#### ObraForm (Modal)
- Crear y Editar en el mismo componente
- Validación: porcentajes deben sumar exactamente 100%
- En edición: aviso de impacto + selector de Estado

### 🔧 Archivos Creados
```
src/api/obras.api.js
src/hooks/useObras.js
src/components/ui/StatCard.jsx
src/components/ui/Badge.jsx
src/components/obras/ObraCard.jsx
src/components/obras/ObraForm.jsx
src/pages/DashboardPage.jsx
src/pages/ObrasPage.jsx
```

### 📊 Endpoints Consumidos
```
GET    /api/obras
GET    /api/obras/:id/dashboard
POST   /api/obras
PUT    /api/obras/:id
DELETE /api/obras/:id
```

---

## [0.1.0] — Core: Auth + Layout + Routing

### ✨ Features Añadidas

#### Login
- Fondo cian con texto gigante "CivitasPay" en transparencia
- Card glassmorphism con backdrop-filter blur
- Manejo de errores del backend con mensaje visible

#### Layout
- Sidebar con navegación y resaltado de ruta activa
- Topbar con ObraSelector (carga obras reales)
- AppLayout responsive: fijo en desktop, deslizable en móvil con overlay

#### Auth
- `authStore` (Zustand + persist): tokens + usuario
- `obraStore` (Zustand + sessionStorage): obra seleccionada globalmente
- Axios con interceptor JWT automático
- Axios con interceptor refresh token al 401
- ProtectedRoute

### 🔧 Archivos Creados
```
src/api/axios.config.js
src/store/authStore.js
src/store/obraStore.js
src/hooks/useAuth.js
src/hooks/useNetwork.js
src/components/ui/Button.jsx
src/components/ui/Input.jsx
src/components/ui/Spinner.jsx
src/components/layout/Sidebar.jsx
src/components/layout/Topbar.jsx
src/components/layout/AppLayout.jsx
src/pages/LoginPage.jsx
src/App.jsx
src/main.jsx
src/index.css
```

### 📊 Endpoints Consumidos
```
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/obras
```

---

## [0.0.0] — Setup e Infraestructura

### ⚙️ Configuraciones
- Proyecto creado con Vite 8 + React 18
- Tailwind CSS 3 con tokens de diseño CivitasPay
- Colores: `civitas-blue`, `civitas-blue-dark`, `civitas-blue-light`, `civitas-blue-pale`, `civitas-bg`
- Variables de entorno: `VITE_API_URL`

### 📦 Dependencias Instaladas
**Producción:** react, react-dom, react-router-dom, zustand, @tanstack/react-query, axios, recharts, lucide-react, react-hook-form, @hookform/resolvers, zod, dexie, react-hot-toast, react-is

**Desarrollo:** vite, @vitejs/plugin-react, vite-plugin-pwa, @vite-pwa/assets-generator, tailwindcss@3, postcss, autoprefixer
```
