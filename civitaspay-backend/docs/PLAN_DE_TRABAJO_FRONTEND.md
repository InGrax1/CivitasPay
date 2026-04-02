# 🎨 CivitasPay - Plan de Trabajo Frontend

## 📋 Visión General del Frontend

**Objetivo:** Desarrollar la PWA (Progressive Web App) de CivitasPay con Angular, soporte offline-first y sincronización automática.

**Stack Tecnológico:**
- **Framework:** Angular 17+ (Standalone Components)
- **UI Library:** Angular Material / Tailwind CSS
- **State Management:** Signals (nativo de Angular 17+)
- **Offline DB:** Dexie.js (IndexedDB)
- **PWA:** @angular/pwa
- **Charts:** Chart.js / Recharts
- **Forms:** Reactive Forms
- **HTTP:** HttpClient con Interceptors
- **Testing:** Jasmine + Karma

---

## 🎯 Fases del Frontend

```
FASE F0: Setup Inicial (1 día)
   └─> Angular CLI, PWA, estructura, Dexie

FASE F1: Core & Autenticación (2 días)
   └─> Login, guards, interceptors, layout

FASE F2: Módulo Obras (2 días)
   └─> Listado, CRUD, categorías

FASE F3: Módulo Estimaciones (2 días)
   └─> Crear, aprobar, flujo de estados

FASE F4: Módulo Gastos (2 días)
   └─> Listado, crear, paginación, filtros

FASE F5: Dashboard & Reportes (2 días)
   └─> Gráficas, KPIs, semáforo de saldos

FASE F6: Sincronización Offline (3 días)
   └─> IndexedDB, sync service, resolución conflictos

FASE F7: Módulos Complementarios (2 días)
   └─> Subcontratos, caja chica

FASE F8: PWA & Optimización (1-2 días)
   └─> Service Worker, caché, instalación

FASE F9: Testing & UX Polish (2 días)
   └─> Tests e2e, responsive, animaciones
```

**Duración Estimada:** 16-20 días (3-4 semanas)

---

## 📅 FASE F0: Setup Inicial

### ✅ Checklist

**Día 1 - Sesión F1: Proyecto Base**

- [ ] **F0.1. Crear proyecto Angular**
  ```bash
  ng new civitaspay-frontend --routing --style=scss
  cd civitaspay-frontend
  ng add @angular/pwa
  ng add @angular/material
  ```

- [ ] **F0.2. Estructura de carpetas**
  ```
  src/
  ├── app/
  │   ├── core/              # Servicios singleton
  │   │   ├── services/
  │   │   ├── guards/
  │   │   ├── interceptors/
  │   │   └── models/
  │   ├── shared/            # Componentes reutilizables
  │   │   ├── components/
  │   │   ├── directives/
  │   │   └── pipes/
  │   ├── features/          # Módulos de funcionalidad
  │   │   ├── auth/
  │   │   ├── obras/
  │   │   ├── gastos/
  │   │   ├── estimaciones/
  │   │   └── dashboard/
  │   ├── layout/            # Layout principal
  │   │   ├── navbar/
  │   │   ├── sidebar/
  │   │   └── footer/
  │   └── offline/           # Sincronización offline
  │       ├── db/
  │       └── sync/
  ```

- [ ] **F0.3. Instalar dependencias**
  ```bash
  npm install dexie
  npm install @angular/material @angular/cdk
  npm install chart.js ng2-charts
  npm install date-fns
  npm install --save-dev @types/uuid
  ```

- [ ] **F0.4. Configuración Dexie.js**
  - Crear `src/app/offline/db/db.ts`
  - Definir esquema de IndexedDB

- [ ] **F0.5. Environment**
  - Configurar `environment.ts` y `environment.prod.ts`
  - API URL: http://localhost:3000/api

**Entregable F0:**
- ✅ Proyecto Angular iniciado
- ✅ PWA configurado
- ✅ Dexie.js setup
- ✅ Estructura de carpetas

---

## 📅 FASE F1: Core & Autenticación

### ✅ Checklist

**Día 2-3 - Sesión F2-F3**

- [ ] **F1.1. Models**
  - `core/models/usuario.model.ts`
  - `core/models/obra.model.ts`
  - `core/models/gasto.model.ts`

- [ ] **F1.2. Auth Service**
  - `core/services/auth.service.ts`
  - Métodos:
    - `login(email, password)`
    - `logout()`
    - `getToken()`
    - `getCurrentUser()`
    - Signal para estado de auth

- [ ] **F1.3. HTTP Interceptor**
  - `core/interceptors/auth.interceptor.ts`
  - Agregar JWT automáticamente
  - Manejar errores 401

- [ ] **F1.4. Auth Guard**
  - `core/guards/auth.guard.ts`
  - Proteger rutas

- [ ] **F1.5. Componente Login**
  - `features/auth/login/login.component.ts`
  - Reactive Form
  - Validaciones
  - Redirigir a dashboard al login

- [ ] **F1.6. Layout Principal**
  - `layout/navbar/navbar.component.ts`
  - Menú lateral
  - Indicador de estado offline/online
  - Contador de pendientes de sync

**Entregable F1:**
- ✅ Login funcional
- ✅ JWT guardado en localStorage
- ✅ Layout con navbar
- ✅ Guards protegiendo rutas

---

## 📅 FASE F2: Módulo Obras

**Día 4-5 - Sesión F4-F5**

- [ ] **F2.1. Obras Service**
  - `features/obras/services/obras.service.ts`
  - CRUD completo con API

- [ ] **F2.2. Listado de Obras**
  - `features/obras/lista-obras/lista-obras.component.ts`
  - Tabla con Angular Material
  - Filtros por estado
  - Acciones: Ver, Editar, Eliminar

- [ ] **F2.3. Crear/Editar Obra**
  - `features/obras/form-obra/form-obra.component.ts`
  - Reactive Form con validaciones
  - Validar suma de porcentajes = 100%
  - Selector de residente

- [ ] **F2.4. Detalle de Obra**
  - `features/obras/detalle-obra/detalle-obra.component.ts`
  - Tabs:
    - Info general
    - Categorías con saldos
    - Estimaciones
    - Gastos recientes

**Entregable F2:**
- ✅ CRUD de obras funcional
- ✅ Validaciones en formularios
- ✅ Listado con filtros

---

## 📅 FASE F3: Módulo Estimaciones

**Día 6-7 - Sesión F6-F7**

- [ ] **F3.1. Estimaciones Service**
- [ ] **F3.2. Listado Estimaciones**
  - Tabla con estados (chips de colores)
  - Filtros por estado

- [ ] **F3.3. Crear Estimación**
  - Form con upload de archivos (XML/PDF)
  - Cálculo automático de montos (solo mostrar)

- [ ] **F3.4. Flujo de Aprobación**
  - Componente para cambiar estado
  - Botones:
    - Auxiliar: "Enviar a Revisión"
    - Admin: "Aprobar", "Rechazar"
  - Confirmación antes de aprobar

**Entregable F3:**
- ✅ Estimaciones CRUD
- ✅ Flujo de estados visual
- ✅ Upload de archivos

---

## 📅 FASE F4: Módulo Gastos

**Día 8-9 - Sesión F8-F9**

- [ ] **F4.1. Gastos Service**
  - Con soporte offline (Dexie)
  - Método `crearGastoOffline()`

- [ ] **F4.2. Listado Gastos**
  - Tabla con paginación
  - Filtros:
    - Por categoría
    - Por fecha
    - Solo personales
  - Indicador sync_status

- [ ] **F4.3. Crear Gasto**
  - Form con campos:
    - Categoría (dropdown)
    - Concepto
    - Monto
    - Checkbox: "Gasto personal"
    - Checkbox: "Caja chica"
    - Upload factura/foto

- [ ] **F4.4. Modo Offline**
  - Detectar si hay internet
  - Guardar en IndexedDB si offline
  - Banner: "Sin conexión - X gastos pendientes"

**Entregable F4:**
- ✅ Gastos funcionando online
- ✅ Guardar offline en Dexie
- ✅ Indicadores visuales de estado

---

## 📅 FASE F5: Dashboard & Reportes

**Día 10-11 - Sesión F10-F11**

- [ ] **F5.1. Dashboard Service**
  - Llamar endpoint de reportes

- [ ] **F5.2. KPI Cards**
  - Total ingresos
  - Total egresos
  - Saldo obra
  - Fondo garantía

- [ ] **F5.3. Gráficas**
  - Chart.js / ng2-charts
  - Gráfica de pastel: Gastos por categoría
  - Gráfica de línea: Evolución mensual

- [ ] **F5.4. Semáforo de Categorías**
  - Verde: < 80% usado
  - Amarillo: 80-100%
  - Rojo: > 100% (saldo negativo)

- [ ] **F5.5. Últimos Gastos**
  - Lista de últimos 10 gastos
  - Link a detalle

**Entregable F5:**
- ✅ Dashboard visual
- ✅ Gráficas funcionando
- ✅ Semáforo de saldos

---

## 📅 FASE F6: Sincronización Offline

**Día 12-14 - Sesión F12-F14**

- [ ] **F6.1. Dexie Database Setup**
  ```typescript
  // offline/db/db.ts
  import Dexie from 'dexie';
  
  export class CivitasPayDB extends Dexie {
    gastos!: Dexie.Table<Gasto, string>;
    sync_queue!: Dexie.Table<SyncOperation, number>;
    
    constructor() {
      super('CivitasPayDB');
      this.version(1).stores({
        gastos: 'id, obra_id, sync_status',
        sync_queue: '++auto_id, estado'
      });
    }
  }
  ```

- [ ] **F6.2. Sync Service**
  - `offline/sync/sync.service.ts`
  - Métodos:
    - `sincronizarTodo()`
    - `push()` → Enviar pendientes
    - `pull()` → Obtener cambios
    - `detectarConflictos()`

- [ ] **F6.3. Network Service**
  - Detectar online/offline
  - EventListener en window
  - Signal de estado

- [ ] **F6.4. Componente Indicador de Sync**
  - Badge en navbar:
    - Verde: "En línea"
    - Rojo: "Sin conexión - X pendientes"
    - Amarillo: "Sincronizando..."
  - Botón: "Sincronizar ahora"

- [ ] **F6.5. Componente Resolución de Conflictos**
  - Modal para mostrar conflictos
  - Vista lado a lado: Local vs Nube
  - Botones:
    - "Usar mi versión"
    - "Usar versión del servidor"
    - "Combinar manualmente"

**Entregable F6:**
- ✅ Sincronización automática
- ✅ Detección offline
- ✅ Resolución de conflictos UI

---

## 📅 FASE F7: Módulos Complementarios

**Día 15-16 - Sesión F15-F16**

- [ ] **F7.1. Subcontratos**
  - CRUD básico
  - Tabla con estados
  - Registrar pagos

- [ ] **F7.2. Caja Chica**
  - Ver saldo
  - Botón "Reponer"
  - Historial de movimientos

**Entregable F7:**
- ✅ Subcontratos y caja chica funcionales

---

## 📅 FASE F8: PWA & Optimización

**Día 17 - Sesión F17**

- [ ] **F8.1. Manifest.json**
  - Iconos de la app
  - Colores de tema
  - Nombre de la app

- [ ] **F8.2. Service Worker**
  - Caché de assets
  - Estrategia network-first para API

- [ ] **F8.3. Instalación PWA**
  - Banner: "Instalar app"
  - Funcionar en celular

- [ ] **F8.4. Optimización**
  - Lazy loading de módulos
  - OnPush change detection
  - Build production

**Entregable F8:**
- ✅ PWA instalable
- ✅ Funciona offline

---

## 📅 FASE F9: Testing & UX

**Día 18-19 - Sesión F18-F19**

- [ ] **F9.1. Tests Unitarios**
  - Services
  - Components críticos

- [ ] **F9.2. Tests E2E**
  - Flujo completo: Login → Crear obra → Crear gasto

- [ ] **F9.3. Responsive Design**
  - Probar en mobile
  - Ajustar layout

- [ ] **F9.4. Animaciones**
  - Transiciones suaves
  - Loading skeletons

**Entregable F9:**
- ✅ App testeada
- ✅ Responsive
- ✅ UX pulida

---

## 🎯 Convenciones de Código

### Estructura de Componentes

```typescript
@Component({
  selector: 'app-lista-gastos',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './lista-gastos.component.html',
  styleUrls: ['./lista-gastos.component.scss']
})
export class ListaGastosComponent implements OnInit {
  // Signals
  gastos = signal<Gasto[]>([]);
  loading = signal(false);
  
  // Dependency Injection
  constructor(
    private gastosService: GastosService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.cargarGastos();
  }
  
  async cargarGastos(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.gastosService.obtenerGastos();
      this.gastos.set(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
```

### Naming Conventions

- **Componentes:** PascalCase + Component
- **Services:** PascalCase + Service
- **Interfaces:** PascalCase
- **Enums:** PascalCase
- **Variables:** camelCase

---

## 📝 Integración Backend ↔ Frontend

### Orden de Desarrollo

1. Backend desarrolla endpoint → Tests pasan
2. Frontend consume endpoint → Mockear si es necesario
3. Integración → Ambos funcionando juntos

### Variables de Entorno

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.civitaspay.com/api'
};
```

---

## ✅ Checklist Final

Antes de considerar el proyecto completo:

- [ ] **Funcionalidad**
  - [ ] Todos los módulos CRUD funcionan
  - [ ] Sincronización offline probada
  - [ ] PWA instalable
  
- [ ] **Calidad**
  - [ ] Tests >70% coverage
  - [ ] Sin errores en consola
  - [ ] Performance: Lighthouse >90
  
- [ ] **UX**
  - [ ] Responsive en móvil
  - [ ] Loading states
  - [ ] Mensajes de error claros
  
- [ ] **Seguridad**
  - [ ] JWT en headers
  - [ ] Guards en rutas protegidas
  - [ ] Validación de inputs

---

¿Listo para empezar con el backend?
