# Plan de Trabajo — CivitasPay Frontend

**Documento para:** Desarrolladores, Project Managers  
**Stack:** React 18 + Vite + Tailwind CSS + Zustand + TanStack Query  
**Duración Estimada:** 10–12 semanas  
**Metodología:** Iterativo por módulo — cada fase es funcional y probada antes de avanzar  

---

## Visión General de Fases

```
FASE 0: Setup e Infraestructura            (2–3 días)
   └─> Vite + React + Tailwind + PWA + ESLint

FASE 1: Core — Auth + Layout + Routing     (3–4 días)
   └─> Login, Sidebar, Topbar, Guards, Zustand, Axios

FASE 2: Módulo Obras                       (4–5 días)
   └─> Dashboard Global, Panel de Obra, ObraForm, ObraCard

FASE 3: Módulo Estimaciones                (3–4 días)
   └─> Lista, Registrar, Cambio de Estado, Motor Financiero Preview

FASE 4: Módulo Gastos                      (3–4 días)
   └─> Lista filtrable, Registrar, Gasto Personal toggle

FASE 5: Módulo Contratos                   (2–3 días)
   └─> Grid de contratos, Nuevo Contrato, Registrar Pago

FASE 6: Módulo Caja Chica                  (2–3 días)
   └─> Panel, Reposición Rápida, Historial de movimientos

FASE 7: Módulo Gasto Personal              (1–2 días)
   └─> Tabla, Donut Chart, Estadísticas

FASE 8: Sincronización Offline             (4–5 días)
   └─> Dexie, syncService, ConflictResolver, SyncIndicator

FASE 9: PWA + Optimización                 (2–3 días)
   └─> Service Worker, Manifest, Lazy Loading, Performance

FASE 10: Testing + QA + Deploy             (3–4 días)
   └─> Unit tests hooks, integration tests, Lighthouse
```

**Total estimado: 29–40 días de desarrollo**

---

## FASE 0 — Setup e Infraestructura

**Objetivo:** Proyecto corriendo con todas las herramientas configuradas y listo para que los módulos de negocio se construyan sobre él.

### Checklist de Tareas

**Día 1 — Crear el proyecto base**

- [ ] **0.1. Inicializar el proyecto con Vite**
  ```bash
  npm create vite@latest civitaspay-frontend -- --template react
  cd civitaspay-frontend
  npm install
  ```

- [ ] **0.2. Instalar todas las dependencias de producción**
  ```bash
  npm install react-router-dom zustand @tanstack/react-query axios \
              recharts lucide-react react-hook-form @hookform/resolvers \
              zod dexie react-hot-toast
  ```

- [ ] **0.3. Instalar dependencias de desarrollo**
  ```bash
  npm install -D tailwindcss postcss autoprefixer \
               vite-plugin-pwa eslint eslint-plugin-react \
               eslint-plugin-react-hooks prettier
  ```

- [ ] **0.4. Configurar Tailwind CSS**
  - Ejecutar `npx tailwindcss init -p`
  - Configurar `tailwind.config.js` con los colores de CivitasPay:
    ```js
    colors: {
      'civitas-blue': '#3D5A99',
      'civitas-blue-dark': '#2E4577',
      'civitas-blue-light': '#5B7FE8',
      'civitas-bg': '#F0F2F8',
    }
    ```
  - Agregar `@tailwind` directives en `src/index.css`

- [ ] **0.5. Configurar Vite con plugin PWA**
  - Editar `vite.config.js`
  - Agregar `VitePWA` con estrategia Network First para `/api/`
  - Agregar `VitePWA` con estrategia Cache First para assets

- [ ] **0.6. Configurar ESLint + Prettier**
  - Crear `.eslintrc.cjs` con reglas de React
  - Crear `.prettierrc` con `{ "semi": true, "singleQuote": true }`
  - Agregar scripts `lint` y `format` en `package.json`

**Día 2 — Estructura de carpetas y archivos base**

- [ ] **0.7. Crear la estructura completa de carpetas**
  ```bash
  mkdir -p src/{api,components/{ui,layout,charts,obras,gastos,estimaciones,contratos,caja-chica,sync},pages/{obras,finanzas},hooks,store,offline,utils}
  mkdir -p docs public
  ```

- [ ] **0.8. Crear `.env.example` y `.env`**
  ```env
  VITE_API_URL=http://localhost:3000/api
  VITE_NODE_ENV=development
  VITE_APP_NAME=CivitasPay
  ```

- [ ] **0.9. Configurar `.gitignore`**
  - Agregar: `node_modules/`, `dist/`, `.env`, `*.local`

- [ ] **0.10. Crear `main.jsx` limpio con providers**
  - `StrictMode` + `QueryClientProvider` + `Toaster`

- [ ] **0.11. Crear `App.jsx` con router básico**
  - Ruta `/` que renderice un placeholder
  - Ruta `/login` que renderice un placeholder

- [ ] **0.12. Verificar que el proyecto corre**
  ```bash
  npm run dev  # debe abrir http://localhost:5173 sin errores
  npm run build # debe generar dist/ sin errores
  ```

**Entregables de Fase 0:**
- ✅ `npm run dev` abre la app sin errores en consola
- ✅ `npm run build` genera `dist/` con Service Worker
- ✅ Tailwind funcionando (verificar con una clase de prueba)
- ✅ Estructura de carpetas completa
- ✅ Variables de entorno configuradas

---

## FASE 1 — Core: Auth + Layout + Routing

**Objetivo:** La app tiene login funcional conectado al backend real, navegación con sidebar, y protección de rutas. Cualquier pantalla tiene el layout correcto.

### Archivos a Crear (12 archivos)

```
src/
├── api/
│   └── axios.config.js        ← Instancia Axios + interceptores JWT
├── store/
│   ├── authStore.js           ← Usuario, tokens, login/logout (Zustand)
│   └── obraStore.js           ← Obra seleccionada globalmente
├── hooks/
│   ├── useAuth.js             ← useLogin(), useLogout(), useMe()
│   └── useNetwork.js          ← Estado online/offline
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx      ← Sidebar + Topbar + Outlet
│   │   ├── Sidebar.jsx        ← Nav lateral con todos los módulos
│   │   ├── Topbar.jsx         ← Barra superior con ObraSelector
│   │   └── ObraSelector.jsx   ← Dropdown global de selección de obra
│   └── ui/
│       ├── Button.jsx
│       ├── Input.jsx
│       └── Spinner.jsx
└── pages/
    └── LoginPage.jsx          ← Glassmorphism + edificios (según Figma)
```

### Checklist de Tareas

**Días 3–4 — Autenticación**

- [ ] **1.1. Crear `api/axios.config.js`**
  - Instancia con `baseURL: import.meta.env.VITE_API_URL`
  - Interceptor de request: inyecta `Authorization: Bearer <token>`
  - Interceptor de response: detecta 401, intenta refresh, o hace logout
  
- [ ] **1.2. Crear `store/authStore.js`**
  - Estado: `usuario`, `accessToken`, `refreshToken`, `isAuthenticated`
  - Acción `login(email, password)`: POST al backend, guarda tokens
  - Acción `logout()`: limpia todo el estado + redirect
  - `persist` middleware para guardar en localStorage
  
- [ ] **1.3. Crear `hooks/useAuth.js`**
  - `useLogin()` → mutation que llama a `authStore.login()`
  - `useLogout()` → llama a `authStore.logout()` + navigate('/login')
  
- [ ] **1.4. Crear `pages/LoginPage.jsx`**
  - Fondo: imagen de edificios con overlay azul cian (según Figma)
  - Card central con glassmorphism (backdrop-filter: blur)
  - Campos: Email (con ícono) + Password (con ícono)
  - Botón "Continuar" con estado de carga
  - Texto "O inicia sesión con" + botones Google/Apple/Facebook (decorativos)
  - Link "Reiniciar Contraseña"
  - Texto de privacidad al pie
  - Al hacer submit: llama a `useLogin()` y navega a `/dashboard`
  - Si hay error: muestra mensaje de error en rojo

**Días 5–6 — Layout**

- [ ] **1.5. Crear `store/obraStore.js`**
  - Estado: `obraSeleccionada` (null o objeto Obra)
  - Acción: `seleccionarObra(obra)`, `limpiarObra()`
  - Persiste en `sessionStorage`

- [ ] **1.6. Crear `components/layout/Sidebar.jsx`**
  - Logo "CivitasPay" en la parte superior
  - Menú con `NavLink` de React Router (resalta el activo automáticamente)
  - Secciones: Menú, Obras (con sub-item Contratos), Finanzas (con sub-ítems), Personal, Config.
  - Botón "Salir" al fondo con ícono LogOut
  - Color de fondo: `civitas-blue` (#3D5A99)
  - Texto blanco, ítem activo con fondo `white/20`
  - Ancho: `w-40` en desktop

- [ ] **1.7. Crear `components/layout/ObraSelector.jsx`**
  - Dropdown que carga obras del backend
  - Muestra "Selecciona Obra" cuando no hay ninguna seleccionada
  - Al seleccionar: actualiza `obraStore`
  - Ícono de triángulo animado (rota al abrir)
  - Cierra al hacer click fuera (useRef + useEffect)

- [ ] **1.8. Crear `components/layout/Topbar.jsx`**
  - Lado izquierdo: espacio vacío (el título viene de cada página)
  - Lado derecho: `ObraSelector` + tres botones circulares (azul, verde, rojo) según Figma
  
- [ ] **1.9. Crear `components/layout/AppLayout.jsx`**
  - Flex row: `<Sidebar />` + div con `<Topbar />` + `<main><Outlet /></main>`
  - Main con scroll independiente

- [ ] **1.10. Actualizar `App.jsx` con todas las rutas reales**
  - Definir `ProtectedRoute` que verifica `isAuthenticated`
  - Agregar todas las rutas con sus componentes placeholder
  - Ruta raíz `/` redirige a `/dashboard`

- [ ] **1.11. Crear componentes UI base**
  - `Button.jsx`: variants primary/secondary/danger/ghost, prop `loading`
  - `Input.jsx`: label + input + mensaje de error + ícono opcional
  - `Spinner.jsx`: animación de carga centrada

- [ ] **1.12. Crear `hooks/useNetwork.js`**
  - Detecta eventos `online`/`offline` del navegador
  - Retorna `{ online, offline }`

**Entregables de Fase 1:**
- ✅ Login funciona con el backend real (email: admin@civitaspay.com / Admin123!)
- ✅ Después del login aparece el sidebar y el layout correcto
- ✅ Las rutas protegidas redirigen a /login si no hay sesión
- ✅ ObraSelector carga las obras reales desde el backend
- ✅ El sidebar resalta la ruta activa correctamente
- ✅ El botón "Salir" hace logout y redirige a /login

---

## FASE 2 — Módulo Obras

**Objetivo:** El usuario puede ver el dashboard global, ver el panel de control de una obra específica, crear nuevas obras y editar las existentes.

### Archivos a Crear (8 archivos)

```
src/
├── api/obras.api.js
├── hooks/useObras.js
├── components/
│   ├── ui/
│   │   ├── StatCard.jsx
│   │   ├── ProgressBar.jsx
│   │   └── Badge.jsx
│   ├── obras/
│   │   ├── ObraCard.jsx
│   │   ├── ObraForm.jsx         ← Modal Registrar + Editar Obra
│   │   └── AlertasObra.jsx
│   └── charts/
│       └── DistribucionCostosChart.jsx
└── pages/
    └── DashboardPage.jsx        ← Home (KPIs globales + grid de obras)
    └── obras/
        └── ObrasPage.jsx        ← Panel de control de la obra seleccionada
```

### Checklist de Tareas

**Días 7–9 — Dashboard Global**

- [ ] **2.1. Crear `api/obras.api.js`**
  - `listar()`, `obtener(id)`, `dashboard(id)`, `crear(data)`, `actualizar(id, data)`, `eliminar(id)`

- [ ] **2.2. Crear `hooks/useObras.js`**
  - `useObras()` → lista de obras
  - `useObraDashboard(obraId)` → datos del dashboard de una obra
  - `useCrearObra()` → mutation con invalidación de caché
  - `useActualizarObra()` → mutation
  - `useEliminarObra()` → mutation (solo Admin)

- [ ] **2.3. Crear `components/ui/StatCard.jsx`**
  - Props: `titulo`, `valor`, `icono`, `colorTexto`, `variacion` (ej: "+12% vs el último mes")
  - Variación en verde si positivo, rojo si negativo

- [ ] **2.4. Crear `components/ui/Badge.jsx`**
  - Props: `estado`, donde estado puede ser: Activo/Pendiente/Cobrado/Excedido/Pausado/Terminado
  - Mapa de colores:
    ```
    Activo → green
    Pendiente / En Revisión → yellow
    Cobrado / Recibido → teal
    Excedido → red
    Pausado → gray
    Terminado / Por Terminar → orange
    ```

- [ ] **2.5. Crear `components/ui/ProgressBar.jsx`**
  - Barra con color dinámico según porcentaje:
    - < 80%: azul
    - 80–100%: amarillo
    - > 100%: rojo (excedido)

- [ ] **2.6. Crear `components/obras/ObraCard.jsx`**
  - Replica exactamente el diseño del Figma (imagen arriba, datos abajo)
  - Props: `obra` con nombre, cliente, porcentaje_gastado, status, foto_url
  - Badge de estado coloreado
  - ProgressBar
  - Botón "Detalles →" que navega a `/obras` y selecciona esa obra

- [ ] **2.7. Crear `pages/DashboardPage.jsx`**
  - Header: "Dashboard" + 4 botones de acción rápida (Nueva Obra, Registrar Gasto, Registrar Estimación, Nuevo Contrato)
  - Row de 4 KPI Cards: Obras Activas, Presupuesto Total, Total Gastado, Estimaciones Cobradas
  - Sección "Proyectos Activos": Grid 2 columnas de `ObraCard`
  - Columna derecha: dos gráficas de Recharts (líneas y donut — ver Figma)

**Días 10–11 — Panel de Control de Obra**

- [ ] **2.8. Crear `components/charts/DistribucionCostosChart.jsx`**
  - `LineChart` de Recharts con 3 líneas: Materiales, Mano de Obra, Herramienta
  - Tooltip personalizado que muestra los valores formateados en MXN
  - Leyenda en la parte inferior

- [ ] **2.9. Crear `components/obras/AlertasObra.jsx`**
  - Lista de alertas del dashboard:
    - 🔴 "Materiales Excedido — La categoría está un +5% sobre el límite"
    - 🟡 "Factura por Pagar — R204 expira en 48hrs"
  - Datos provienen de `balance_categorias` del endpoint dashboard

- [ ] **2.10. Crear `pages/obras/ObrasPage.jsx`**
  - Header: "Panel de control de la Obra" + ObraSelector (duplicado en el header) + botón "+ Nueva Obra" + botón Config (ícono)
  - Botones de acción: "Registrar gastos" y "Registrar Estimaciones"
  - 4 KPI Cards: Costo del Contrato (con IVA), Costo Directo, Estimaciones Cobradas, Total Gastado c/d (con progress bar)
  - Sección "Distribución de costos": Tabs (Materiales / Equipo y Herramienta / Mano de Obra) + `DistribucionCostosChart`
  - Sección "Estimaciones": Tabla con Fecha, Descripción, Monto, Status
  - Columna derecha superior: Panel de Alertas
  - Columna derecha media: Transacciones Recientes
  - Columna derecha inferior: Ubicación y Residente de Obra

- [ ] **2.11. Crear `components/obras/ObraForm.jsx`**
  - Modal con React Hook Form + Zod
  - Campos (según Figma de Registrar Obra y Editar Obra):
    - Nombre de la Obra (texto + ícono $)
    - Fecha de Inicio/Fin (con ícono calendario)
    - Monto Bruto del Contrato (número)
    - Aportación %
    - Ubicación (con ícono mapa)
    - Residente de Obra (dropdown de usuarios con rol RESIDENTE)
    - Fotografía de la obra (FileUpload drag & drop)
    - Distribución del Presupuesto: Materiales (%), Nómina (%), Herramienta (%)
    - Validación: los 3 porcentajes deben sumar 100%
    - Total dinámico que muestra cuánto suman los porcentajes
  - Botones: "Cancelar" + "Crear Obra" (o "Actualizar Información" en edición)
  - Editar: muestra título "Editar Obra" + aviso naranja "Cualquier cambio afectará los registros existentes"

**Entregables de Fase 2:**
- ✅ Dashboard muestra obras reales desde el backend
- ✅ Panel de obra muestra KPIs financieros reales del endpoint `/dashboard`
- ✅ Gráfica de distribución de costos renderiza con datos reales
- ✅ Modal "Registrar Obra" guarda en el backend y la lista se actualiza
- ✅ Modal "Editar Obra" carga datos existentes y los actualiza
- ✅ Badges de estado con colores correctos según el Figma
- ✅ Solo el Admin ve el botón "Eliminar Obra"

---

## FASE 3 — Módulo Estimaciones

**Objetivo:** El usuario puede ver, registrar y cambiar el estado de estimaciones. El sistema muestra el cálculo financiero automático antes de guardar.

### Archivos a Crear (5 archivos)

```
src/
├── api/estimaciones.api.js
├── hooks/useEstimaciones.js
├── components/estimaciones/
│   ├── EstimacionForm.jsx       ← Modal Registrar Estimación
│   ├── EstimacionRow.jsx        ← Fila de tabla con badge de estado
│   └── MotorFinancieroPreview.jsx ← Muestra el desglose antes de guardar
└── pages/finanzas/
    └── EstimacionesPage.jsx
```

### Checklist de Tareas

**Días 12–14 — Estimaciones**

- [ ] **3.1. Crear `api/estimaciones.api.js`**
  - `listar(obraId)`, `obtener(obraId, id)`, `crear(obraId, data)`, `cambiarEstado(obraId, id, estado)`, `eliminar(obraId, id)`

- [ ] **3.2. Crear `hooks/useEstimaciones.js`**
  - `useEstimaciones(obraId)` → lista con QueryKey `['obras', obraId, 'estimaciones']`
  - `useCrearEstimacion(obraId)` → mutation
  - `useCambiarEstadoEstimacion(obraId)` → mutation PATCH

- [ ] **3.3. Crear `components/estimaciones/MotorFinancieroPreview.jsx`**
  - Se muestra dentro del EstimacionForm cuando el usuario ingresa el monto bruto
  - Calcula en tiempo real (sin llamar al backend):
    ```
    Monto Bruto Ingresado: $200,000.00
    ───────────────────────────────────
    (-) IVA (16%):          $27,586.21
    (-) Retención (5%):      $8,620.69
    ═══════════════════════════════════
    Costo Directo:         $163,793.10
    ───────────────────────────────────
    → Materiales (60%):     $98,275.86
    → Nómina (30%):         $49,137.93
    → Herramienta (10%):    $16,379.31
    ```
  - Los porcentajes vienen de `obraSeleccionada` en el store

- [ ] **3.4. Crear `components/estimaciones/EstimacionForm.jsx`**
  - Campos (según Figma de Registrar Estimación):
    - Número de Estimación (autocompletado, readonly)
    - Monto Bruto (número — dispara el MotorFinancieroPreview)
    - Fecha (date picker)
    - Proveedor/Vendedor (texto)
    - Categoría (dropdown: Transferencia/Efectivo/CajaChica)
    - Archivo de la Factura (FileUpload)
  - `MotorFinancieroPreview` se muestra cuando hay monto ingresado
  - Botones: "Cancelar" + "Registrar"

- [ ] **3.5. Crear `pages/finanzas/EstimacionesPage.jsx`**
  - Header: "Estimaciones y anticipos" + subtítulo
  - 2 KPI Cards: "Ingresos Totales Recaudados" (con variación) + "Saldo Pendiente" (con alerta si hay pendientes)
  - Botones de acción: "Últimos 30 Días" + "Exportar" + "Registrar Estimaciones"
  - Tabla con columnas: Fecha, Concepto/Descripción, Estado (badge), Usuario, Monto
  - Filtros por estado: Borrador / En Revisión / Aprobada / Cobrada
  - Paginación "Anterior / Siguiente"
  - Solo Admin ve el botón "Aprobar" en cada fila

**Entregables de Fase 3:**
- ✅ Lista de estimaciones carga desde el backend
- ✅ El preview del motor financiero calcula en tiempo real al escribir el monto
- ✅ Crear estimación funciona y la lista se actualiza
- ✅ El Admin puede cambiar estados: BORRADOR → EN_REVISION → APROBADA → COBRADA
- ✅ El Auxiliar solo puede mandar a EN_REVISION

---

## FASE 4 — Módulo Gastos

**Objetivo:** Registro completo de gastos con filtros por categoría, soporte para gasto personal (Shadow Expenses), y panel de sumatoria mensual.

### Archivos a Crear (5 archivos)

```
src/
├── api/gastos.api.js
├── hooks/useGastos.js
├── components/gastos/
│   ├── GastoForm.jsx
│   └── GastoRow.jsx
└── pages/finanzas/
    └── GastosPage.jsx
```

### Checklist de Tareas

**Días 15–17 — Gastos**

- [ ] **4.1. Crear `api/gastos.api.js`**
  - `listar(obraId, filtros)`, `resumenCategorias(obraId)`, `obtener(obraId, id)`, `crear(obraId, data)`, `actualizar(obraId, id, data)`, `eliminar(obraId, id)`

- [ ] **4.2. Crear `hooks/useGastos.js`**
  - `useGastos(obraId, filtros)` → con filtros aplicados a queryKey
  - `useResumenCategorias(obraId)` → para el panel lateral
  - `useCrearGasto(obraId)` → mutation

- [ ] **4.3. Crear `components/gastos/GastoForm.jsx`**
  - Campos (según Figma Registrar Gasto):
    - Categoría (dropdown: Materiales / Nómina / Herramienta)
    - Monto (número con ícono $)
    - Fecha
    - Proveedor/Vendedor (texto)
    - Toggle "Gasto Personal" (si se activa, marca `is_personal: true`)
    - Concepto/Descripción (textarea)
    - Ticket de la compra (FileUpload)
  - Banner de advertencia si el saldo es bajo: "El saldo actual es $120. Es posible que se requiera una autorización para reponerlo."
  - Botones: "Cancelar" + "Guardar"

- [ ] **4.4. Crear `pages/finanzas/GastosPage.jsx`**
  - Header: "Gastos y transacciones" + subtítulo
  - Botones: "Últimos 30 Días" + "Exportar" + "Registrar gastos" + ObraSelector
  - Filtros por tabs: Todos / Materiales / Mano de Obra / Herramienta / Personal
  - Tabla principal (izquierda): Fecha, Concepto/Descripción, Categoría (badge con color), Usuario, Monto
  - Panel lateral (derecha): "Sumatoria Mensual" con:
    - Total Gastado
    - Subtítulo "12% menos que Diciembre"
    - "Desglose por categoría" con barras de colores y montos
  - Paginación "Anterior / Siguiente"

**Entregables de Fase 4:**
- ✅ Lista de gastos carga y filtra por categoría
- ✅ Badges de categoría con color correcto (azul, verde, naranja, amarillo)
- ✅ Toggle "Gasto Personal" funciona — el gasto aparece bajo "Personal"
- ✅ Panel de Sumatoria Mensual muestra totales por categoría
- ✅ El Admin puede eliminar gastos

---

## FASE 5 — Módulo Contratos

**Objetivo:** Visualización y gestión de contratos por obra en grid de tarjetas con indicadores de progreso y estado.

### Archivos a Crear (4 archivos)

```
src/
├── api/contratos.api.js
├── hooks/useContratos.js
├── components/contratos/
│   └── ContratoCard.jsx
└── pages/obras/
    └── ContratosPage.jsx
```

### Checklist de Tareas

**Días 18–19 — Contratos**

- [ ] **5.1. Crear `api/contratos.api.js`** y `hooks/useContratos.js`

- [ ] **5.2. Crear `components/contratos/ContratoCard.jsx`**
  - Título del contrato (coloreado según estado: verde=Activo, amarillo=Por Terminar, rojo=Terminado)
  - Nombre de la empresa
  - Montos: Contratado + Facturado
  - Barra de progreso "Proceso de la Ejecución" con porcentaje
  - Fechas inicio → fin
  - Badge de estado en la parte inferior

- [ ] **5.3. Crear `pages/obras/ContratosPage.jsx`**
  - Header: "Contratos" + subtítulo + ObraSelector
  - Botones de acción: "Nuevo Contrato" + "Registrar Pago"
  - Grid 3 columnas de `ContratoCard`
  - Paginación
  - Modal "Nuevo Contrato" con campos: Proveedor/Vendedor, Monto Bruto, Fecha, Nombre, Concepto, Categoría, FileUpload

**Entregables de Fase 5:**
- ✅ Grid de contratos muestra datos reales por obra seleccionada
- ✅ Cards con colores correctos según estado
- ✅ Barras de progreso con porcentaje calculado
- ✅ Modal "Nuevo Contrato" guarda en el backend

---

## FASE 6 — Módulo Caja Chica

**Objetivo:** Panel de control de la caja chica con saldo en tiempo real, formulario de reposición rápida, gráfica de flujo y gauge de uso.

### Archivos a Crear (4 archivos)

```
src/
├── api/cajaChica.api.js
├── hooks/useCajaChica.js
├── components/
│   ├── ui/Gauge.jsx            ← Medidor tipo velocímetro
│   └── charts/FlujoCajaChart.jsx
└── pages/finanzas/
    └── CajaChicaPage.jsx
```

### Checklist de Tareas

**Días 20–21 — Caja Chica**

- [ ] **6.1. Crear `api/cajaChica.api.js`** y `hooks/useCajaChica.js`

- [ ] **6.2. Crear `components/ui/Gauge.jsx`**
  - SVG semicircular que muestra un porcentaje (0–100%)
  - Colores: verde (<70%), amarillo (70–90%), rojo (>90%)
  - Texto en el centro con el porcentaje
  - Texto bajo el gauge: "El uso de la caja se encuentra actualmente dentro de los límites operativos adecuados."

- [ ] **6.3. Crear `components/charts/FlujoCajaChart.jsx`**
  - `AreaChart` de Recharts con dos series: Entrada (verde) y Salida (rojo)
  - Eje X: días de la semana (Lunes–Domingo)
  - Áreas con transparencia
  - Leyenda "Entrada / Salida"

- [ ] **6.4. Crear `pages/finanzas/CajaChicaPage.jsx`**
  - Header: "Caja Chica" + ObraSelector
  - KPI grande: "Liquidez Total $XXX.XX"
  - Dos KPIs pequeños: "Entrada Mensual (+$X)" y "Salida Mensual (-$X)"
  - Grid 3 columnas:
    - Col 1: Formulario "Reposición Rápida" (Cantidad Entregada, Fecha, Destinatario, Botón)
    - Col 2: `FlujoCajaChart`
    - Col 3: `Gauge` con porcentaje de uso
  - Tabla inferior: Fecha, ID de Referencia, Beneficiario, Monto, Status
  - Paginación

**Entregables de Fase 6:**
- ✅ Liquidez total muestra saldo real desde el backend
- ✅ Gráfica de flujo muestra entradas/salidas de la semana
- ✅ Gauge muestra porcentaje de uso correcto
- ✅ Formulario de Reposición guarda y actualiza el saldo

---

## FASE 7 — Módulo Gasto Personal

**Objetivo:** Vista de Shadow Expenses con tabla filtrada y donut chart de distribución por categoría.

### Archivos a Crear (2 archivos)

```
src/
├── components/charts/
│   └── GastosPieChart.jsx      ← Donut chart
└── pages/finanzas/
    └── GastoPersonalPage.jsx
```

### Checklist de Tareas

**Día 22 — Gasto Personal**

- [ ] **7.1. Crear `components/charts/GastosPieChart.jsx`**
  - `PieChart` de Recharts con `innerRadius` (donut)
  - Total en el centro
  - Leyenda lateral con nombre + monto por categoría

- [ ] **7.2. Crear `pages/finanzas/GastoPersonalPage.jsx`**
  - Header: "Gasto Personal" + botón "Registrar gastos"
  - 3 StatCards: Total Gastado, Total Mensual Gastado, Categoría con más gastos (con ícono y nombre)
  - Layout 2 columnas:
    - Col izquierda (70%): Tabla con Fecha, Categoría, Tienda, Descripción, Monto
    - Col derecha (30%): "Distribución por categoría" + `GastosPieChart` + lista con leyenda
  - Paginación

- [ ] **7.3. Reusar `GastoForm.jsx`** pero con `is_personal: true` preseleccionado

**Entregables de Fase 7:**
- ✅ Tabla muestra solo gastos con `is_personal = true`
- ✅ Donut chart muestra distribución real por categoría
- ✅ StatCard "Categoría con más gastos" muestra la correcta

---

## FASE 8 — Sincronización Offline

**Objetivo:** La app funciona sin internet, guarda datos en IndexedDB, y sincroniza automáticamente cuando vuelve la conexión.

### Archivos a Crear (5 archivos)

```
src/
├── offline/
│   ├── db.js               ← Esquema Dexie (IndexedDB)
│   └── syncService.js      ← Lógica push/pull/conflictos
├── hooks/
│   └── useSync.js          ← Hook para acceder al sync service
└── components/sync/
    ├── SyncIndicator.jsx   ← Badge online/offline en Topbar
    └── ConflictResolver.jsx ← Modal para conflictos
```

### Checklist de Tareas

**Días 23–26 — Offline**

- [ ] **8.1. Crear `offline/db.js`** con esquema Dexie completo
  - Tablas: `gastos`, `estimaciones`, `sync_queue`, `obras_cache`
  - Índices para búsquedas eficientes

- [ ] **8.2. Crear `offline/syncService.js`**
  - `procesarCola()`: lee `sync_queue`, envía al backend, marca como sincronizado
  - `descargarCambios()`: pull desde el backend y actualiza IndexedDB
  - `detectarConflictos()`: compara versiones local vs nube

- [ ] **8.3. Integrar el modo offline en `GastoForm.jsx`**
  - Si `useNetwork().offline` → guarda en Dexie en lugar de llamar a la API
  - Toast diferente: "Guardado offline 📵"

- [ ] **8.4. Crear `components/sync/SyncIndicator.jsx`**
  - Verde con WiFi: "En línea"
  - Rojo con WiFi-Off: "Sin conexión — X pendientes"
  - Amarillo con spinner: "Sincronizando..."
  - Se coloca en `Topbar.jsx`

- [ ] **8.5. Crear `hooks/useSync.js`**
  - Escucha el evento `online` del navegador
  - Al conectar: llama `syncService.procesarCola()` automáticamente
  - Expone: `{ sincronizando, pendientes, ultimaSincronizacion }`

- [ ] **8.6. Crear `components/sync/ConflictResolver.jsx`**
  - Modal que aparece cuando hay conflictos
  - Muestra los datos local vs servidor lado a lado
  - Botones: "Usar mi versión" / "Usar versión del servidor"

**Entregables de Fase 8:**
- ✅ Con WiFi apagado, GastoForm guarda en IndexedDB
- ✅ SyncIndicator muestra "Sin conexión — 1 pendiente"
- ✅ Al reconectarse, el gasto se sincroniza automáticamente
- ✅ SyncIndicator vuelve a verde después de sincronizar

---

## FASE 9 — PWA + Optimización

**Objetivo:** La app puede instalarse en el dispositivo, carga en < 2 segundos, y pasa Lighthouse con score ≥ 90.

### Checklist de Tareas

**Días 27–29**

- [ ] **9.1. Preparar íconos PWA**
  - `public/icon-192x192.png` y `public/icon-512x512.png`
  - Favicon `public/icon.svg`

- [ ] **9.2. Verificar el manifest de PWA** en `vite.config.js`
  - `name`, `short_name`, `theme_color`, `background_color`, `display: standalone`

- [ ] **9.3. Implementar Lazy Loading de páginas** en `App.jsx`
  ```jsx
  const DashboardPage = lazy(() => import('./pages/DashboardPage'));
  ```
  - Envolver con `<Suspense fallback={<Spinner />}>`
  - Reduce el bundle inicial significativamente

- [ ] **9.4. Optimizar imágenes**
  - Convertir la imagen de fondo del login a WebP
  - Agregar `loading="lazy"` en imágenes de `ObraCard`

- [ ] **9.5. Ejecutar Lighthouse en Chrome DevTools**
  - Performance: target ≥ 90
  - Accessibility: target ≥ 90
  - Best Practices: target ≥ 90
  - PWA: ✅ Installable

- [ ] **9.6. Probar instalación en móvil**
  - Android: Chrome → Menú → "Agregar a pantalla de inicio"
  - iOS: Safari → Share → "Agregar a pantalla de inicio"

**Entregables de Fase 9:**
- ✅ App instalable en Android e iOS
- ✅ Lighthouse Performance ≥ 90
- ✅ Bundle inicial < 500KB gzipped
- ✅ Carga inicial < 2 segundos en conexión 4G

---

## FASE 10 — Testing + QA + Deploy

**Objetivo:** Cobertura mínima de tests en hooks críticos y listo para deploy en producción.

### Checklist de Tareas

**Días 30–33**

- [ ] **10.1. Instalar herramientas de testing**
  ```bash
  npm install -D vitest @testing-library/react @testing-library/user-event jsdom
  ```

- [ ] **10.2. Tests unitarios de utilidades**
  - `utils/formatCurrency.test.js`
  - `utils/financialMath.test.js` — verificar que los cálculos coinciden con el backend

- [ ] **10.3. Tests de hooks**
  - `hooks/useAuth.test.js` — login exitoso, login fallido, logout
  - `hooks/useObras.test.js` — que llama al endpoint correcto

- [ ] **10.4. Tests de componentes UI**
  - `Button.jsx` — renderiza, responde a click, muestra spinner en loading
  - `Badge.jsx` — aplica el color correcto según el estado

- [ ] **10.5. Build de producción final**
  ```bash
  npm run build
  npm run preview  # verificar en localhost:4173
  ```

- [ ] **10.6. Checklist de producción**
  - [ ] `VITE_API_URL` apunta al backend en producción
  - [ ] `NODE_ENV=production`
  - [ ] Service Worker funciona en el preview
  - [ ] Sin `console.log` en el código de producción
  - [ ] Todas las rutas protegidas redirigen si no hay sesión

**Entregables de Fase 10:**
- ✅ Cobertura de tests ≥ 60%
- ✅ `npm run build` sin warnings críticos
- ✅ Preview de producción funciona end-to-end

---

## Convenciones de Git

### Ramas

```
main          ← Producción. Solo merges con PR aprobado.
develop       ← Integración. Aquí se integran las features.
feature/*     ← Una rama por feature/fase
fix/*         ← Correcciones de bugs
```

### Flujo

```bash
git checkout develop
git checkout -b feature/fase-1-auth-layout
# ... desarrollas ...
git add .
git commit -m "feat: implementar login con JWT y layout principal"
git push origin feature/fase-1-auth-layout
# Crear PR de feature/fase-1-auth-layout → develop
```

### Mensajes de Commit

```
feat: Implementar ObraCard con ProgressBar
fix: Corregir color de Badge en estado "Por Terminar"
docs: Actualizar CHANGELOG con Fase 2
test: Agregar tests de useObras
style: Alinear Sidebar con Figma
refactor: Extraer ObraSelector a componente separado
chore: Actualizar react-router a 6.22
```

---

## Resumen de Tiempos

| Fase | Descripción | Días Est. |
|------|-------------|-----------|
| 0 | Setup e Infraestructura | 2–3 |
| 1 | Core: Auth + Layout + Routing | 3–4 |
| 2 | Módulo Obras + Dashboard | 4–5 |
| 3 | Módulo Estimaciones | 3–4 |
| 4 | Módulo Gastos | 3–4 |
| 5 | Módulo Contratos | 2–3 |
| 6 | Módulo Caja Chica | 2–3 |
| 7 | Módulo Gasto Personal | 1–2 |
| 8 | Sincronización Offline | 4–5 |
| 9 | PWA + Optimización | 2–3 |
| 10 | Testing + QA + Deploy | 3–4 |
| **TOTAL** | | **29–40 días** |
