# Changelog — CivitasPay Frontend

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/), y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### 🔜 Próximamente
- Fase 0: Setup e infraestructura del proyecto
- Fase 1: Autenticación JWT + Layout + Routing

---

## Estado Actual del Proyecto

| Métrica | Valor |
|---------|-------|
| **Versión** | 0.0.0 (pre-desarrollo) |
| **Progreso General** | 0% |
| **Fases Completadas** | Ninguna |
| **Fases Pendientes** | 11 (Fase 0 → Fase 10) |
| **Páginas implementadas** | 0 / 9 |
| **Componentes creados** | 0 |
| **Tests** | 0% cobertura |
| **PWA** | No configurada |
| **Offline** | No implementado |

---

## Historial de Versiones

---

## [0.10.0] — FASE 10: Testing + QA + Deploy _(Pendiente)_

### ✨ Features Añadidas
- Tests unitarios para utilidades de formato y cálculo financiero
- Tests de integración para hooks críticos (`useAuth`, `useObras`, `useGastos`)
- Tests de componentes UI (`Button`, `Badge`, `StatCard`)

### ⚙️ Configuración
- Configurar Vitest + Testing Library + jsdom
- Build de producción optimizado
- Checklist de producción completado

### 📊 Métricas Esperadas
- Cobertura de tests ≥ 60%
- Lighthouse Performance ≥ 90
- Lighthouse PWA: Installable ✅
- Bundle inicial < 500KB gzipped

---

## [0.9.0] — FASE 9: PWA + Optimización _(Pendiente)_

### ✨ Features Añadidas
- Íconos PWA configurados (192x192 y 512x512)
- App instalable en Android (Chrome) e iOS (Safari)
- Lazy loading de todas las páginas con `React.lazy()`
- Imágenes convertidas a WebP para menor peso

### ⚙️ Configuración
- Manifest PWA configurado con nombre, colores y display standalone
- Service Worker con estrategia Cache First para assets
- Service Worker con estrategia Network First para `/api/*`

### 📊 KPIs de Performance
- Carga inicial: < 2 segundos en 4G
- Time to Interactive: < 3 segundos
- Bundle principal: < 200KB gzipped

---

## [0.8.0] — FASE 8: Sincronización Offline _(Pendiente)_

### ✨ Features Añadidas

#### Capa Offline (Dexie / IndexedDB)
- Base de datos local con tablas: `gastos`, `estimaciones`, `sync_queue`, `obras_cache`
- `syncService.procesarCola()`: envía operaciones pendientes al backend
- `syncService.descargarCambios()`: pull de cambios desde el servidor
- `syncService.detectarConflictos()`: detecta divergencias por versión

#### Indicadores Visuales
- `SyncIndicator` en Topbar: Verde (online) / Rojo (offline) / Amarillo (sincronizando)
- Badge con contador de operaciones pendientes
- Toast al reconectar: "Sincronizando X operaciones pendientes..."

#### Resolución de Conflictos
- Modal `ConflictResolver` para que el Admin resuelva conflictos manualmente
- Vista lado a lado: datos locales vs datos del servidor
- Opciones: "Usar mi versión" / "Usar versión del servidor"

### 🔧 Modificaciones a Módulos Existentes
- `GastoForm.jsx`: detecta modo offline → guarda en IndexedDB → toast diferente
- `EstimacionForm.jsx`: mismo patrón que GastoForm para offline

### 🧪 Tests

```
✅ Gasto guardado offline aparece en IndexedDB
✅ Al reconectarse, el gasto se sincroniza automáticamente
✅ SyncIndicator cambia de estado correctamente
✅ ConflictResolver muestra ambas versiones correctamente
```

---

## [0.7.0] — FASE 7: Módulo Gasto Personal _(Pendiente)_

### ✨ Features Añadidas

#### GastoPersonalPage
- 3 StatCards: Total Gastado, Total Mensual, Categoría con más gastos (con ícono y monto)
- Tabla de Shadow Expenses con columnas: Fecha, Categoría, Tienda, Descripción, Monto
- Paginación "Anterior / Siguiente"

#### GastosPieChart
- Donut chart de Recharts con distribución por categoría
- Total en el centro del donut
- Leyenda lateral con color, nombre y monto de cada categoría

#### Módulos API y Hooks
- `gastos.api.js`: filtro `is_personal=true` para obtener solo gastos personales
- `useGastosPersonales(obraId)`: hook específico para esta página

### 📊 Endpoints Consumidos
- `GET /api/obras/:obraId/gastos?is_personal=true`
- `GET /api/obras/:obraId/gastos/resumen/categorias`

---

## [0.6.0] — FASE 6: Módulo Caja Chica _(Pendiente)_

### ✨ Features Añadidas

#### CajaChicaPage
- KPI principal: "Liquidez Total" con monto destacado
- KPIs secundarios: Entrada Mensual (+) y Salida Mensual (-)
- Formulario "Reposición Rápida": Cantidad, Fecha, Destinatario (Residente), Botón "Confirmar Transacción"
- Historial en tabla: Fecha, ID de Referencia, Beneficiario, Monto, Status

#### FlujoCajaChart
- AreaChart de Recharts con dos series: Entrada (verde) y Salida (rojo)
- Áreas con opacidad para visualizar solapamiento
- Eje X: días de la semana (Lunes–Domingo)

#### Gauge (Medidor Semicircular)
- SVG semicircular con porcentaje de uso de la caja
- Colores dinámicos: verde / amarillo / rojo
- Texto descriptivo del estado ("Dentro de límites operativos")

#### Módulos API y Hooks
- `cajaChica.api.js`: listar cajas, detalle + movimientos, reposición, gasto, ajuste, toggle
- `useCajaChica(obraId)`: queries y mutations para todos los endpoints

### 📊 Endpoints Consumidos
- `GET /api/obras/:obraId/caja-chica`
- `GET /api/obras/:obraId/caja-chica/:id` (con movimientos)
- `POST /api/obras/:obraId/caja-chica/:id/reposicion`
- `POST /api/obras/:obraId/caja-chica/:id/gasto`

---

## [0.5.0] — FASE 5: Módulo Contratos _(Pendiente)_

### ✨ Features Añadidas

#### ContratosPage
- Header con ObraSelector y botones de acción: "Nuevo Contrato" + "Registrar Pago"
- Grid 3 columnas de `ContratoCard` con paginación

#### ContratoCard
- Título del contrato con color según estado:
  - Verde → Activo
  - Amarillo → Por Terminar
  - Rojo → Terminado
- Montos Contratado y Facturado
- ProgressBar "Proceso de la Ejecución" con porcentaje
- Fechas de inicio y fin con ícono de calendario
- Badge de estado en la parte inferior

#### Formulario "Nuevo Contrato"
- Campos: Proveedor/Vendedor, Monto Bruto, Fecha Inicio/Fin, Nombre, Concepto, Categoría, FileUpload
- Validación con Zod + React Hook Form

### 📊 Endpoints Consumidos
- `GET /api/obras/:obraId/subcontratos`
- `POST /api/obras/:obraId/subcontratos`
- `POST /api/obras/:obraId/subcontratos/:id/pagos`
- `PATCH /api/obras/:obraId/subcontratos/:id/estado`

---

## [0.4.0] — FASE 4: Módulo Gastos _(Pendiente)_

### ✨ Features Añadidas

#### GastosPage
- Filtros por tabs: Todos / Materiales / Mano de Obra / Herramienta / Personal
- Tabla principal: Fecha, Concepto/Descripción, Categoría (badge), Usuario, Monto
- Panel lateral "Sumatoria Mensual" con:
  - Total Gastado + variación vs mes anterior
  - Desglose por categoría con mini barras de colores

#### GastoForm (Modal)
- Campos: Categoría (dropdown), Monto, Fecha, Proveedor, Toggle "Gasto Personal", Concepto (textarea), Ticket de compra (FileUpload)
- Banner de advertencia cuando el saldo de la categoría es bajo
- `is_personal: true` cuando el toggle está activado

#### Componentes UI Nuevos
- Badge de categoría con colores diferenciados por tipo

### 📊 Endpoints Consumidos
- `GET /api/obras/:obraId/gastos?categoria_id=&fecha_desde=&fecha_hasta=`
- `GET /api/obras/:obraId/gastos/resumen/categorias`
- `POST /api/obras/:obraId/gastos`
- `PUT /api/obras/:obraId/gastos/:id`
- `DELETE /api/obras/:obraId/gastos/:id` (solo Admin)

---

## [0.3.0] — FASE 3: Módulo Estimaciones _(Pendiente)_

### ✨ Features Añadidas

#### EstimacionesPage
- 2 KPI Cards: Ingresos Totales Recaudados (con variación) + Saldo Pendiente
- Botones: "Últimos 30 Días" + "Exportar" + "Registrar Estimaciones"
- Tabla: Fecha, Concepto/Descripción, Estado (badge), Usuario, Monto
- Paginación

#### EstimacionForm (Modal)
- Campos: Número de estimación (auto), Monto Bruto, Fecha, Proveedor/Vendedor, Categoría, FileUpload
- **MotorFinancieroPreview**: se activa al ingresar el monto bruto y muestra en tiempo real el desglose completo sin llamar al backend

#### MotorFinancieroPreview
- Cálculo en tiempo real: IVA → Retención → Costo Directo → Distribución por categoría
- Los porcentajes provienen de `obraStore` (obra actualmente seleccionada)
- Se muestra solo cuando hay un monto ingresado

#### Cambio de Estado (RBAC en UI)
- Auxiliar ve botón: "Enviar a Revisión" (BORRADOR → EN_REVISION)
- Admin ve botones: "Aprobar" (EN_REVISION → APROBADA) + "Marcar como Cobrada" (APROBADA → COBRADA)

### 📊 Endpoints Consumidos
- `GET /api/obras/:obraId/estimaciones`
- `POST /api/obras/:obraId/estimaciones`
- `PATCH /api/obras/:obraId/estimaciones/:id/estado`
- `DELETE /api/obras/:obraId/estimaciones/:id` (solo Admin, solo BORRADOR)

---

## [0.2.0] — FASE 2: Módulo Obras + Dashboard _(Pendiente)_

### ✨ Features Añadidas

#### DashboardPage (Home Global)
- 4 KPI Cards: Obras Activas, Presupuesto Total, Total Gastado, Estimaciones Cobradas
- Grilla 2×3 de `ObraCard` con datos reales
- Gráfica de distribución de gastos (líneas) columna derecha
- Gráfica de distribución por herramienta (donut) columna derecha

#### ObrasPage (Panel de Control de Obra)
- 4 KPI Cards financieras: Costo del Contrato (con IVA), Costo Directo, Estimaciones Cobradas, Total Gastado c/d (con % y barra)
- Distribución de costos: tabs + LineChart de Recharts
- Tabla de estimaciones recientes
- Panel derecho: Alertas + Transacciones recientes + Ubicación + Residente de Obra

#### ObraCard
- Imagen de obra con overlay de status
- Nombre + Cliente
- ProgressBar de presupuesto gastado
- Badge de estado coloreado (Activo/En Revisión/Excedido/Pausado)
- Botón "Detalles →" que selecciona la obra globalmente

#### ObraForm (Modal)
- Registrar Obra: campos completos según Figma
- Editar Obra: mismos campos con datos precargados + aviso de impacto
- Validación: porcentajes deben sumar exactamente 100%

#### Componentes UI Nuevos
- `StatCard`: ícono + título + valor + variación
- `ProgressBar`: color dinámico por porcentaje
- `Badge`: colores por tipo de estado
- `DistribucionCostosChart`: LineChart con 3 series
- `AlertasObra`: lista de alertas con íconos de severidad

### 🔧 Archivos Creados
```
src/api/obras.api.js
src/hooks/useObras.js
src/components/ui/StatCard.jsx
src/components/ui/ProgressBar.jsx
src/components/ui/Badge.jsx
src/components/obras/ObraCard.jsx
src/components/obras/ObraForm.jsx
src/components/obras/AlertasObra.jsx
src/components/charts/DistribucionCostosChart.jsx
src/pages/DashboardPage.jsx
src/pages/obras/ObrasPage.jsx
```

### 📊 Endpoints Consumidos
- `GET /api/obras` → Lista de obras
- `GET /api/obras/:id/dashboard` → Todos los datos financieros de la obra
- `POST /api/obras` → Crear obra
- `PUT /api/obras/:id` → Actualizar obra
- `DELETE /api/obras/:id` → Soft delete (solo Admin)

---

## [0.1.0] — FASE 1: Core — Auth + Layout + Routing _(Pendiente)_

### ✨ Features Añadidas

#### Sistema de Autenticación Completo
- `LoginPage`: glassmorphism card sobre fondo de edificios con overlay cian
- `authStore` (Zustand + persist): guarda tokens en localStorage
- Axios con interceptores JWT: access token automático en headers
- Refresh token automático: renueva el access token antes de expirar
- Logout completo: limpia store + localStorage + redirige
- `ProtectedRoute`: guarda todas las rutas internas

#### Layout Principal
- `Sidebar`: navegación colapsable con todas las secciones (Menú/Obras/Finanzas/Personal/Config)
- `Topbar`: barra superior con `ObraSelector` y controles de usuario
- `ObraSelector`: dropdown que selecciona la obra activa globalmente (persiste en sessionStorage)
- `AppLayout`: contenedor Sidebar + Topbar + `<Outlet />` para páginas

#### Routing Completo
- Todas las rutas definidas con sus páginas placeholder
- Rutas protegidas que redirigen a `/login` si no hay sesión
- Ruta raíz `/` redirige a `/dashboard`
- `Navigate` para rutas no encontradas

#### Componentes UI Base
- `Button`: variants primary/secondary/danger/ghost + estado loading con spinner
- `Input`: label + input estilizado + mensaje de error + ícono opcional
- `Spinner`: indicador de carga centrado

#### State Management
- `authStore`: usuario + tokens + `isAuthenticated` (persistido)
- `obraStore`: obra seleccionada globalmente (session)

#### Hooks Base
- `useAuth()`: `useLogin()`, `useLogout()`
- `useNetwork()`: detección de conectividad online/offline

### 🔧 Archivos Creados
```
src/api/axios.config.js
src/store/authStore.js
src/store/obraStore.js
src/hooks/useAuth.js
src/hooks/useNetwork.js
src/components/layout/AppLayout.jsx
src/components/layout/Sidebar.jsx
src/components/layout/Topbar.jsx
src/components/layout/ObraSelector.jsx
src/components/ui/Button.jsx
src/components/ui/Input.jsx
src/components/ui/Spinner.jsx
src/pages/LoginPage.jsx
```

### 🔐 Seguridad Implementada
- JWT access token de 15 minutos
- Refresh token de 7 días
- Auto-refresh al detectar 401
- Redireccionamiento automático a /login al expirar

### 🧪 Tests
```
✅ Login exitoso → redirige a /dashboard
✅ Credenciales incorrectas → muestra error en rojo
✅ Sin token → ruta protegida redirige a /login
✅ Token expirado → auto-refresh transparente
✅ ObraSelector carga obras reales del backend
✅ Logout limpia la sesión completamente
```

### 📊 Endpoints Consumidos
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/obras` (para el ObraSelector)

---

## [0.0.0] — FASE 0: Setup e Infraestructura _(Pendiente)_

### ⚙️ Configuraciones
- Proyecto creado con Vite 5 + React 18 (`npm create vite@latest`)
- Tailwind CSS 3 configurado con tokens de diseño de CivitasPay
- postcss + autoprefixer configurados
- ESLint + Prettier configurados con reglas de React
- vite-plugin-pwa configurado con manifest básico
- Variables de entorno en `.env` y `.env.example`
- `.gitignore` completo para Node.js + Vite
- Estructura de carpetas completa creada

### 📦 Dependencias Instaladas

**Producción:**
- react@18.3, react-dom@18.3
- react-router-dom@6
- zustand@4 (con middleware persist)
- @tanstack/react-query@5
- axios@1
- recharts@2
- lucide-react
- react-hook-form@7
- @hookform/resolvers
- zod@3
- dexie@3
- react-hot-toast@2

**Desarrollo:**
- vite@5
- @vitejs/plugin-react
- vite-plugin-pwa
- tailwindcss@3 + postcss + autoprefixer
- eslint + eslint-plugin-react + eslint-plugin-react-hooks
- prettier

### 🔧 Scripts Configurados
```json
"scripts": {
  "dev":     "vite",
  "build":   "vite build",
  "preview": "vite preview",
  "lint":    "eslint src --ext .js,.jsx",
  "format":  "prettier --write src/"
}
```

### ✅ Verificaciones
- `npm run dev` → abre sin errores en `http://localhost:5173`
- `npm run build` → genera `dist/` con `sw.js` (Service Worker)
- Tailwind funcionando con clase de prueba
- Variables de entorno accesibles en el código

---

## Formato de este Changelog

Cada versión documenta:
- **✨ Features Añadidas**: nuevas funcionalidades
- **🔧 Modificaciones**: cambios a código existente
- **🐛 Bugs Corregidos**: errores resueltos
- **⚙️ Configuraciones**: cambios de setup/tooling
- **🔐 Seguridad**: mejoras de seguridad
- **📊 Endpoints Consumidos**: qué endpoints del backend usa cada fase
- **🧪 Tests**: qué se probó y verificó
- **🔧 Archivos Creados**: lista de nuevos archivos

---

_Changelog generado en Abril 2026 — CivitasPay Frontend v0.0.0_
