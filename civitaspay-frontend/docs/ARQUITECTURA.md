# Arquitectura Técnica — CivitasPay Frontend

**Documento para:** Desarrolladores, Arquitectos de Software  
**Versión:** 1.0.0  
**Última actualización:** Abril 2026  
**Tecnología principal:** React 18 + Vite 5 + Tailwind CSS  

---

## Índice

1. [Visión General](#1-visión-general)
2. [Filosofía de Arquitectura](#2-filosofía-de-arquitectura)
3. [Diagrama de Capas](#3-diagrama-de-capas)
4. [Gestión de Estado](#4-gestión-de-estado)
5. [Capa de API](#5-capa-de-api)
6. [Sistema de Componentes](#6-sistema-de-componentes)
7. [Routing](#7-routing)
8. [Arquitectura Offline-First](#8-arquitectura-offline-first)
9. [PWA — Service Worker](#9-pwa--service-worker)
10. [Flujo de Datos Completo](#10-flujo-de-datos-completo)
11. [Seguridad en el Frontend](#11-seguridad-en-el-frontend)
12. [Decisiones Técnicas Clave](#12-decisiones-técnicas-clave)

---

## 1. Visión General

CivitasPay Frontend sigue una arquitectura de **SPA (Single Page Application)** con capacidades **Offline-First** implementadas como una **PWA (Progressive Web App)**. Su rol es exclusivamente de **presentación y experiencia de usuario**: toda la lógica de negocio, validaciones financieras y RBAC viven en el backend.

### Principios Fundamentales

| Principio | Descripción |
|-----------|-------------|
| **Offline-First** | La app funciona sin internet. Los datos fluyen: IndexedDB → UI → Backend (cuando hay conexión) |
| **Separation of Concerns** | API / Estado / UI son capas completamente separadas |
| **Server-State vs Client-State** | TanStack Query maneja datos del servidor. Zustand maneja estado de sesión. `useState` maneja estado local de UI |
| **Componentes como LEGO** | Átomos → Moléculas → Organismos → Páginas |
| **Zero Business Logic en UI** | Los cálculos financieros (IVA, retenciones, distribución) viven en el backend. El frontend solo muestra los valores calculados. |

---

## 2. Filosofía de Arquitectura

### El problema que resuelve esta arquitectura

Sin una arquitectura clara, una SPA de este tamaño (11 módulos, 43 endpoints) se convierte en "spaghetti de hooks": `useEffect` anidados, fetch directo en componentes de página, estado duplicado entre componentes, y re-renders innecesarios que degradan la performance.

### La solución: Capas bien definidas

```
┌────────────────────────────────────────────┐
│              PÁGINAS (pages/)               │  ← Solo orquestación
│  DashboardPage, GastosPage, ObrasPage...    │
└──────────────────┬─────────────────────────┘
                   │ usan
┌──────────────────▼─────────────────────────┐
│           CUSTOM HOOKS (hooks/)             │  ← Lógica de negocio UI
│  useObras, useGastos, useEstimaciones...    │
└────────┬──────────────────┬────────────────┘
         │ usan             │ usan
┌────────▼──────┐  ┌────────▼────────────────┐
│  TanStack     │  │      ZUSTAND            │
│  Query        │  │  (authStore, obraStore) │  ← Estado global
│  (server      │  └─────────────────────────┘
│   state)      │
└────────┬──────┘
         │ llama a
┌────────▼────────────────────────────────────┐
│              CAPA API (api/)                │  ← Comunicación backend
│  axios.config + obras.api + gastos.api...   │
└────────┬────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────┐
│        BACKEND (civitaspay-backend)         │  ← API REST en :3000
│  43 endpoints — Node.js + Express + MySQL   │
└─────────────────────────────────────────────┘
```

---

## 3. Diagrama de Capas

### Vista completa del sistema

```
╔══════════════════════════════════════════════════════════════╗
║                    REACT APPLICATION                         ║
║                                                              ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │                 PRESENTATION LAYER                    │   ║
║  │                                                       │   ║
║  │  pages/          components/ui/    components/layout/ │   ║
║  │  LoginPage       Button            Sidebar            │   ║
║  │  DashboardPage   Input             Topbar             │   ║
║  │  ObrasPage       Modal             AppLayout          │   ║
║  │  GastosPage      StatCard                             │   ║
║  │  ...             Table                                │   ║
║  └──────────────────────┬────────────────────────────────┘   ║
║                         │ consume                            ║
║  ┌──────────────────────▼────────────────────────────────┐   ║
║  │                  LOGIC LAYER                          │   ║
║  │                                                       │   ║
║  │  hooks/                    store/                     │   ║
║  │  useObras()  ←──────────── obraStore (obra selected) │   ║
║  │  useGastos()               authStore (user + tokens)  │   ║
║  │  useAuth()                                            │   ║
║  │  useNetwork()                                         │   ║
║  │  useSync()                                            │   ║
║  └──────┬────────────────────┬──────────────────────────┘   ║
║         │                   │                               ║
║  ┌──────▼──────┐   ┌────────▼──────────────────────────┐   ║
║  │  TANSTACK   │   │         OFFLINE LAYER             │   ║
║  │  QUERY      │   │                                   │   ║
║  │             │   │  offline/db.js (Dexie IndexedDB)  │   ║
║  │  Cache +    │   │  offline/syncService.js           │   ║
║  │  Refetch    │   │                                   │   ║
║  └──────┬──────┘   └────────┬──────────────────────────┘   ║
║         │                   │                               ║
║  ┌──────▼───────────────────▼──────────────────────────┐   ║
║  │                    API LAYER                        │   ║
║  │                                                     │   ║
║  │  api/axios.config.js  ← Interceptores JWT          │   ║
║  │  api/obras.api.js                                   │   ║
║  │  api/gastos.api.js                                  │   ║
║  │  api/estimaciones.api.js                            │   ║
║  │  ...                                                │   ║
║  └──────────────────────┬──────────────────────────────┘   ║
║                         │                                    ║
╚═════════════════════════╪════════════════════════════════════╝
                          │ HTTP/HTTPS
                          ▼
            ┌─────────────────────────┐
            │   civitaspay-backend    │
            │   localhost:3000/api    │
            │   Node.js + Express     │
            │   MySQL 8.0             │
            └─────────────────────────┘
```

---

## 4. Gestión de Estado

CivitasPay usa **tres tipos de estado** con herramientas distintas según la naturaleza de los datos:

### 4.1 Estado del Servidor — TanStack Query

Para datos que viven en el backend (obras, gastos, estimaciones). TanStack Query los cachea, los mantiene frescos y maneja loading/error automáticamente.

```
Request → TanStack Query Cache → Componente
              ↑
         Si stale, refetch en background
```

**Configuración global en App.jsx:**
```jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // Datos frescos por 5 minutos
      gcTime: 10 * 60 * 1000,      // Garbage collection a los 10 min
      retry: 1,                     // Reintentar 1 vez si falla
      refetchOnWindowFocus: false,  // No refetch al hacer focus (UX más suave)
    }
  }
});
```

**QueryKeys — Estructura jerárquica:**
```js
// Patrón: [recurso, id?, subruta?]
['obras']                           // Lista de obras
['obras', obraId]                   // Detalle de una obra
['obras', obraId, 'dashboard']      // Dashboard de una obra
['obras', obraId, 'gastos']         // Gastos de una obra
['obras', obraId, 'estimaciones']   // Estimaciones de una obra

// Invalidar todo lo relacionado a una obra:
queryClient.invalidateQueries({ queryKey: ['obras', obraId] });
```

### 4.2 Estado Global de Sesión — Zustand

Para datos de sesión que múltiples componentes necesitan simultáneamente.

**authStore.js:**
```
Estado:
- usuario: { id, nombre, email, rol, empresa_id, permisos }
- accessToken: string
- refreshToken: string
- isAuthenticated: boolean

Acciones:
- login(email, password) → llama al backend, guarda tokens
- logout() → limpia todo el store
- refreshTokens() → renueva el accessToken

Persistencia: localStorage (via zustand/middleware persist)
```

**obraStore.js:**
```
Estado:
- obraSeleccionada: Obra | null

Acciones:
- seleccionarObra(obra)
- limpiarObra()

Persiste en: sessionStorage (no queremos que persista entre sesiones)
```

### 4.3 Estado Local de UI — useState / useReducer

Para estado que solo importa dentro de un componente: si un modal está abierto, el valor de un input, un tab activo.

```jsx
// Ejemplos de estado LOCAL — NO va a Zustand
const [modalAbierto, setModalAbierto] = useState(false);
const [tabActivo, setTabActivo] = useState('materiales');
const [busqueda, setBusqueda] = useState('');
```

### Regla de decisión de estado

```
¿El dato viene del backend?
  └─ SÍ → TanStack Query

¿Más de un componente no relacionado necesita el dato?
  └─ SÍ → Zustand
  └─ NO → useState en el componente más cercano

¿Es estado de un formulario?
  └─ SÍ → React Hook Form
```

---

## 5. Capa de API

### 5.1 Configuración de Axios (axios.config.js)

```
Request →[Interceptor Request]→ Backend
              |
              Agrega automáticamente:
              - Authorization: Bearer <accessToken>
              - Content-Type: application/json

Response ←[Interceptor Response]← Backend
              |
              Si 401 (token expirado):
              - Intenta POST /api/auth/refresh
              - Si ok: reintenta el request original
              - Si falla: logout + redirect /login
```

### 5.2 Patrón de archivos API

Cada módulo tiene su archivo API con funciones puras que devuelven Promises:

```js
// api/obras.api.js — Patrón estándar
import api from './axios.config';

export const obrasAPI = {
  listar: () =>
    api.get('/obras').then(r => r.data.obras),

  obtener: (id) =>
    api.get(`/obras/${id}`).then(r => r.data.data),

  dashboard: (id) =>
    api.get(`/obras/${id}/dashboard`).then(r => r.data.data),

  crear: (data) =>
    api.post('/obras', data).then(r => r.data),

  actualizar: (id, data) =>
    api.put(`/obras/${id}`, data).then(r => r.data),

  eliminar: (id) =>
    api.delete(`/obras/${id}`).then(r => r.data),
};
```

### 5.3 Patrón de Custom Hook sobre la API

```js
// hooks/useObras.js — Encapsula TanStack Query + obrasAPI
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obrasAPI } from '../api/obras.api';

// Leer lista de obras
export function useObras() {
  return useQuery({
    queryKey: ['obras'],
    queryFn: obrasAPI.listar,
  });
}

// Crear obra (con invalidación automática del caché)
export function useCrearObra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: obrasAPI.crear,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['obras'] }),
  });
}
```

```jsx
// Uso en un componente (extremadamente limpio)
function DashboardPage() {
  const { data: obras, isLoading } = useObras();
  const crearObra = useCrearObra();

  if (isLoading) return <Spinner />;

  return (
    <>
      {obras.map(o => <ObraCard key={o.id} obra={o} />)}
      <Button onClick={() => crearObra.mutate(nuevaObraData)}>
        Nueva Obra
      </Button>
    </>
  );
}
```

---

## 6. Sistema de Componentes

Sigue el patrón **Atomic Design** adaptado al proyecto:

### Nivel 1 — Átomos (components/ui/)

Piezas genéricas sin lógica de negocio. Pueden usarse en cualquier módulo.

```
Button      → variants: primary, secondary, danger, ghost
Input       → con icono prefijo, label, mensaje de error
Modal       → overlay + card + close button
Badge       → colores: green(Activo), yellow(Pendiente), red(Excedido), gray
StatCard    → icono + título + valor + variación
Table       → cabecera + rows + paginación
ProgressBar → color dinámico según porcentaje
Dropdown    → selector con opciones
FileUpload  → drag & drop + botón + preview
Spinner     → loading indicator
Gauge       → medidor semicircular (para Caja Chica)
```

### Nivel 2 — Moléculas (components/[módulo]/)

Combinaciones de átomos con lógica de un módulo específico.

```
ObraCard          → StatCard + Badge + ProgressBar + Button
GastoForm         → Input + Dropdown + FileUpload + Toggle (Gasto Personal)
EstimacionForm    → Input + FileUpload + MotorFinancieroPreview
ContratoCard      → Badge + ProgressBar + fechas formateadas
```

### Nivel 3 — Organismos (components/layout/)

Secciones completas de la UI.

```
Sidebar           → Logo + NavLinks + logout
Topbar            → ObraSelector + SyncIndicator + UserMenu
AppLayout         → Sidebar + Topbar + <Outlet />
```

### Nivel 4 — Páginas (pages/)

Orquestan todo. Solo contienen hooks + layout de la página específica. Sin lógica de negocio inline.

```jsx
// Patrón de página — Orquestación pura
function GastosPage() {
  const { obraSeleccionada } = useObraStore();
  const { data: gastos, isLoading } = useGastos(obraSeleccionada?.id);
  const { data: resumen } = useResumenCategorias(obraSeleccionada?.id);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <div>
      <PageHeader titulo="Gastos y Transacciones" />
      <GastosFilters value={filtroCategoria} onChange={setFiltroCategoria} />
      <div className="flex gap-4">
        <GastosTable data={gastos} isLoading={isLoading} />
        <SumatoriaMensual data={resumen} />
      </div>
      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)}>
        <GastoForm onSuccess={() => setModalAbierto(false)} />
      </Modal>
    </div>
  );
}
```

---

## 7. Routing

### Estructura del Router

```
BrowserRouter
└── QueryClientProvider
    └── Routes
        ├── /login → LoginPage (pública)
        └── / → ProtectedRoute (valida JWT)
            └── AppLayout (Sidebar + Topbar + Outlet)
                ├── /dashboard → DashboardPage
                ├── /obras → ObrasPage
                │   └── /obras/contratos → ContratosPage
                ├── /finanzas/gastos → GastosPage
                ├── /finanzas/estimaciones → EstimacionesPage
                ├── /finanzas/caja-chica → CajaChicaPage
                ├── /finanzas/gasto-personal → GastoPersonalPage
                └── /config → ConfigPage
```

### Guardia de Rutas (ProtectedRoute)

```jsx
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const accessToken = useAuthStore(s => s.accessToken);

  // Verificar que el token no esté expirado
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

### Navegación Programática

```jsx
// Para navegar desde código (no desde un link)
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    await login(email, password);
    navigate('/dashboard'); // ← Redirige después del login
  };
}
```

---

## 8. Arquitectura Offline-First

### Estrategia General

```
Flujo ONLINE normal:
  UI → Hook → TanStack Query → API → Backend → MySQL

Flujo OFFLINE:
  UI → Hook → Detecta offline → IndexedDB (Dexie) → sync_queue

Cuando vuelve la conexión:
  useNetwork (online event) → syncService.procesarCola() → API → Backend
```

### Esquema de IndexedDB (Dexie)

```js
// offline/db.js
db.version(1).stores({
  // Tabla local de gastos con sus índices de búsqueda
  gastos:        'id, obra_id, sync_status, fecha_gasto',
  estimaciones:  'id, obra_id, sync_status',

  // Cola de operaciones pendientes de sincronizar
  sync_queue:    '++auto_id, tabla, operacion, estado, created_at',

  // Caché de obras para modo offline
  obras_cache:   'id, empresa_id, updated_at',
});
```

### sync_status Flow

```
PENDIENTE → (cuando hay internet) → API exitosa → SINCRONIZADO
PENDIENTE → (cuando hay internet) → Error de conflicto → CONFLICTO
```

### Detección de Conectividad

```js
// hooks/useNetwork.js
export function useNetwork() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline  = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { online, offline: !online };
}
```

### Operational Transformation (simplificada)

Siguiendo la estrategia del backend, el frontend **no envía el estado final**, sino la **operación matemática**:

```js
// NO enviamos: "El nuevo saldo es $800"
// SÍ enviamos: "Operación: RESTAR $200 de categoría materiales"

const operacion = {
  tabla: 'gastos',
  tipo: 'INSERT',
  payload: gastoData,         // El gasto completo
  timestamp: Date.now(),
  version_base: obraVersion,  // Versión en la que se basó la operación
};
```

---

## 9. PWA — Service Worker

### Estrategias de Caché por Tipo de Recurso

| Tipo | Estrategia | Descripción |
|------|-----------|-------------|
| Assets estáticos (JS, CSS, imágenes) | **Cache First** | Sirve desde caché, actualiza en background |
| Llamadas a la API (`/api/*`) | **Network First** | Intenta red, cae a caché si falla |
| Página HTML | **Network First** | Siempre intenta red para tener la última versión |

### Configuración en vite.config.js

```js
VitePWA({
  registerType: 'autoUpdate',  // Actualiza automáticamente sin preguntar
  manifest: {
    name: 'CivitasPay',
    short_name: 'CivitasPay',
    theme_color: '#3D5A99',    // Color del toolbar en móvil
    display: 'standalone',     // Sin barra del navegador al instalar
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],  // Assets a pre-cachear
    runtimeCaching: [
      {
        urlPattern: /\/api\//,
        handler: 'NetworkFirst',
        options: { cacheName: 'api-cache', expiration: { maxAgeSeconds: 86400 } }
      }
    ]
  }
})
```

### Flujo de Actualización

```
Usuario abre app → SW verifica versión en background
  └─ Si hay nueva versión → SW descarga en background
  └─ Al recargar la página → Nueva versión activa
  └─ (autoUpdate: true = automático, sin intervención del usuario)
```

---

## 10. Flujo de Datos Completo

### Ejemplo: Registrar un Gasto

```
1. Usuario llena GastoForm y presiona "Guardar"
   └─> handleSubmit(data) ejecuta

2. useNetwork() verifica conectividad:
   ├─ ONLINE:
   │   └─> crearGasto.mutate(data)  [TanStack Mutation]
   │       └─> gastosAPI.crear(data)  [Axios POST /obras/:id/gastos]
   │           └─> Backend valida + guarda en MySQL
   │           └─> Retorna { id, mensaje }
   │       └─> onSuccess: invalidateQueries(['obras', obraId, 'gastos'])
   │       └─> Toast "Gasto registrado ✓"
   │       └─> Modal se cierra
   │
   └─ OFFLINE:
       └─> guardarGastoOffline(data)  [Dexie IndexedDB]
           └─> Genera UUID local con crypto.randomUUID()
           └─> Guarda en db.gastos con sync_status: 'PENDIENTE'
           └─> Agrega a db.sync_queue
           └─> Toast "Guardado offline. Se sincronizará al conectar. 📵"
           └─> Modal se cierra

3. Cuando vuelve internet (evento 'online'):
   └─> syncService.procesarCola()
       └─> Lee db.sync_queue WHERE estado = 'PENDIENTE'
       └─> Para cada operación:
           ├─ POST /api/obras/:id/gastos (el mismo payload)
           ├─ Si 201: marca sync_status = 'SINCRONIZADO'
           └─ Si conflicto: marca sync_status = 'CONFLICTO'
               └─> Notifica al Admin para resolución manual
```

---

## 11. Seguridad en el Frontend

### Almacenamiento de Tokens

Los tokens JWT se guardan en `localStorage` via Zustand persist. Esto es un trade-off consciente:

| Opción | XSS Riesgo | CSRF Riesgo | Conveniencia PWA |
|--------|-----------|------------|-----------------|
| localStorage | Medio | Bajo | ✅ Alta |
| httpOnly Cookie | Bajo | Medio | ❌ Baja (offline) |
| Memory only | Bajo | Bajo | ❌ Se pierde al recargar |

**Mitigaciones implementadas:**
- Access Token dura solo 15 minutos
- Refresh Token de 7 días con rotación automática
- Content Security Policy (CSP) vía headers del backend
- Todo el código que usa el token está en interceptores de Axios, no disperso

### Variables de Entorno

Todas las variables en `VITE_*` son visibles en el bundle compilado. **Nunca guardar:**
- Claves de API de terceros
- Secrets de cualquier tipo
- Credenciales de base de datos

La URL del backend (`VITE_API_URL`) es la única variable que se usa en el frontend.

### Sanitización de Inputs

React escapa automáticamente el contenido de JSX, previniendo XSS por defecto. Los campos de texto del usuario nunca se insertan con `dangerouslySetInnerHTML`.

---

## 12. Decisiones Técnicas Clave

### ¿Por qué Vite en lugar de Create React App?

CRA está oficialmente deprecado. Vite ofrece HMR en menos de 50ms vs los 2-5 segundos de CRA, y el build es hasta 10x más rápido gracias a Rollup.

### ¿Por qué Zustand en lugar de Redux?

Redux requiere un mínimo de 5 archivos para una feature (action, reducer, selector, store config, saga/thunk). Zustand hace lo mismo en 30 líneas. Para una app de este tamaño, la simplicidad de Zustand es suficiente y el equipo puede iterar más rápido.

### ¿Por qué TanStack Query en lugar de useEffect + fetch?

Sin TanStack Query, cada componente que necesita datos del servidor implementa su propio: `const [data, setData] = useState([])`, `const [loading, setLoading] = useState(true)`, `useEffect(() => { fetch()... }, [])`. Esto lleva a: duplicación de datos en memoria, race conditions, no hay caché compartida, y el mismo endpoint se llama múltiples veces innecesariamente. TanStack Query resuelve todo esto.

### ¿Por qué Tailwind CSS?

El diseño en Figma de CivitasPay usa un sistema de diseño específico (colores, radios, espaciados). Con Tailwind, los tokens del diseño se mapean directamente a clases utilitarias en `tailwind.config.js`. Sin necesidad de escribir un solo archivo CSS custom.

### ¿Por qué Recharts?

Recharts está construido sobre React nativo, usa SVG responsive, y sus componentes se integran con el ciclo de vida de React. Las alternativas como Chart.js requieren manipulación del DOM fuera de React, creando anti-patrones.

### ¿Por qué React Hook Form + Zod?

React Hook Form registra los inputs directamente en el DOM sin re-renders en cada keystroke, lo que es crítico en formularios complejos como "Registrar Obra" (8+ campos). Zod valida con TypeScript-first schemas, y la integración con RHF via `zodResolver` permite validar en el cliente con los mismos schemas del backend.

---

**Documento vivo:** Se actualiza con cada decisión arquitectónica significativa.
