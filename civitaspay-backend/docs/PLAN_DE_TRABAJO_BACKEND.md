# 🚀 CivitasPay - Plan de Trabajo Backend

## 📋 Visión General del Proyecto

**Objetivo:** Desarrollar el backend de CivitasPay (Sistema de Gestión Financiera para Construcción) siguiendo arquitectura limpia, buenas prácticas y desarrollo profesional.

**Stack Tecnológico:**
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Base de Datos:** MySQL 8.0
- **ORM:** Sin ORM (SQL puro con prepared statements)
- **Autenticación:** JWT
- **Testing:** Jest + Supertest
- **Linter:** ESLint + Prettier
- **Control de Versiones:** Git + GitHub

**Arquitectura:** Clean Architecture (Controllers → Services → Repositories)

---

## 🎯 Fases del Proyecto

```
FASE 0: Setup Inicial (1 día)
   └─> Git, estructura, dependencias, configuración

FASE 1: Core & Autenticación (2-3 días)
   └─> Database config, middleware, auth completo

FASE 2: Módulo Obras (2 días)
   └─> CRUD obras, categorías, validaciones

FASE 3: Módulo Estimaciones (2-3 días)
   └─> Estimaciones, fórmula financiera, aprobaciones

FASE 4: Módulo Gastos (2 días)
   └─> CRUD gastos, triggers, gastos personales

FASE 5: Módulo Subcontratos (1-2 días)
   └─> Subcontratos, pagos, recálculo de base

FASE 6: Módulo Caja Chica (1 día)
   └─> Caja chica, reposiciones, movimientos

FASE 7: Sincronización Offline (3-4 días)
   └─> Push/Pull, conflictos, operational transformation

FASE 8: Reportes & Dashboards (1-2 días)
   └─> Reportes financieros, vistas, agregaciones

FASE 9: Testing & Documentación (2 días)
   └─> Tests unitarios, integración, Postman collection

FASE 10: Deploy & Optimización (1-2 días)
   └─> Docker, CI/CD, monitoreo
```

**Duración Estimada:** 18-24 días (4-5 semanas)

---

## 📅 FASE 0: Setup Inicial del Proyecto

### ✅ Checklist de Tareas

**Día 1 - Sesión 1: Configuración de Git y Proyecto Base**

- [ ] **0.1. Inicializar repositorio Git**
  - Crear repositorio en GitHub: `civitaspay-backend`
  - Configurar `.gitignore` para Node.js
  - Crear README.md inicial
  - Primer commit: "Initial commit"

- [ ] **0.2. Estructura de carpetas (Clean Architecture)**
  ```
  civitaspay-backend/
  ├── src/
  │   ├── config/           # Configuraciones (DB, JWT, etc.)
  │   ├── controllers/      # Controladores (capa de entrada)
  │   ├── services/         # Lógica de negocio
  │   ├── repositories/     # Acceso a datos (SQL)
  │   ├── middleware/       # Middleware (auth, RBAC, logs)
  │   ├── routes/           # Definición de rutas
  │   ├── utils/            # Utilidades (UUID, fechas, etc.)
  │   ├── validators/       # Validación de esquemas (Joi)
  │   └── app.js            # Configuración de Express
  ├── tests/                # Tests
  │   ├── unit/
  │   ├── integration/
  │   └── fixtures/
  ├── docs/                 # Documentación adicional
  ├── scripts/              # Scripts SQL, seeds, etc.
  ├── .env.example          # Template de variables de entorno
  ├── .gitignore
  ├── package.json
  ├── server.js             # Punto de entrada
  ├── README.md
  └── docker-compose.yml    # MySQL local
  ```

- [ ] **0.3. Inicializar Node.js**
  - `npm init -y`
  - Configurar `package.json` con scripts
  - Instalar dependencias principales

- [ ] **0.4. Dependencias Iniciales**
  ```bash
  # Producción
  npm install express mysql2 dotenv bcrypt jsonwebtoken cors helmet morgan uuid joi

  # Desarrollo
  npm install --save-dev nodemon eslint prettier jest supertest
  ```

- [ ] **0.5. Configuración de ESLint y Prettier**
  - Crear `.eslintrc.json`
  - Crear `.prettierrc`
  - Configurar reglas estándar (Airbnb style guide)

- [ ] **0.6. Variables de Entorno**
  - Crear `.env.example` con todas las variables
  - Crear `.env` (NO subirlo a Git)
  - Documentar cada variable

- [ ] **0.7. Configuración de MySQL Local (Docker)**
  - Crear `docker-compose.yml`
  - Levantar MySQL: `docker-compose up -d`
  - Ejecutar `CivitasPay.sql`
  - Verificar tablas creadas

- [ ] **0.8. Server.js básico**
  - Crear servidor Express básico
  - Configurar puerto desde .env
  - Endpoint de health check: `GET /api/health`
  - Probar: `npm run dev` → http://localhost:3000/api/health

**Entregable Fase 0:**
- ✅ Repositorio Git creado
- ✅ Estructura de carpetas lista
- ✅ Dependencias instaladas
- ✅ MySQL corriendo con BD creada
- ✅ Servidor Express levantando
- ✅ Health check funcionando

---

## 📅 FASE 1: Core & Autenticación

### ✅ Checklist de Tareas

**Día 2 - Sesión 2: Configuración de Base de Datos**

- [ ] **1.1. Config de Pool de Conexiones MySQL**
  - Crear `src/config/database.js`
  - Pool con manejo de errores
  - Función `testConnection()`
  - Exportar pool para reutilización

- [ ] **1.2. Middleware de Logging**
  - Crear `src/middleware/logger.js`
  - Usar `morgan` para logs HTTP
  - Custom logger para errores

- [ ] **1.3. Middleware de Manejo de Errores**
  - Crear `src/middleware/errorHandler.js`
  - Centralizar respuestas de error
  - Validar formato estándar de respuestas

**Día 3 - Sesión 3: Sistema de Autenticación**

- [ ] **1.4. Repository: Usuarios**
  - Crear `src/repositories/usuarios.repository.js`
  - Métodos:
    - `findByEmail(email)`
    - `findById(id)`
    - `create(userData)`
  - SQL con prepared statements

- [ ] **1.5. Service: Auth**
  - Crear `src/services/auth.service.js`
  - Lógica:
    - `login(email, password)` → Validar credenciales, generar JWT
    - `hashPassword(password)` → Bcrypt
    - `comparePassword(plain, hash)`
  - Incluir datos del usuario y rol en JWT payload

- [ ] **1.6. Controller: Auth**
  - Crear `src/controllers/auth.controller.js`
  - Endpoints:
    - `POST /api/auth/login`
    - `POST /api/auth/logout`
    - `POST /api/auth/refresh`

- [ ] **1.7. Middleware: Auth & RBAC**
  - Crear `src/middleware/auth.js`
    - `verifyToken()` → Valida JWT
    - `requireAuth()` → Middleware para rutas protegidas
  - Crear `src/middleware/rbac.js`
    - `requireRole(['ADMINISTRADOR'])` → Valida rol

- [ ] **1.8. Routes: Auth**
  - Crear `src/routes/auth.routes.js`
  - Registrar rutas en `app.js`

- [ ] **1.9. Seed Data: Roles y Usuario Admin**
  - Script SQL para insertar roles
  - Script para crear usuario admin inicial
  - Ejecutar en BD

**Día 4 - Sesión 4: Testing de Autenticación**

- [ ] **1.10. Test: Auth Login**
  - Crear `tests/integration/auth.test.js`
  - Casos:
    - Login exitoso
    - Credenciales inválidas
    - Email no existe
    - Verificar que JWT se genera
  - `npm test`

- [ ] **1.11. Test: Middleware Auth**
  - Probar token válido
  - Probar token expirado
  - Probar sin token
  - Probar RBAC (Admin vs Auxiliar)

**Entregable Fase 1:**
- ✅ Pool de conexiones MySQL funcionando
- ✅ Sistema de login completo
- ✅ JWT generado y validado
- ✅ RBAC implementado
- ✅ Tests de auth pasando

---

## 📅 FASE 2: Módulo Obras

### ✅ Checklist de Tareas

**Día 5 - Sesión 5: CRUD Obras**

- [ ] **2.1. Repository: Obras**
  - `src/repositories/obras.repository.js`
  - Métodos:
    - `findAll(empresaId, filters)`
    - `findById(id)`
    - `create(obraData)`
    - `update(id, obraData)`
    - `softDelete(id)`
  - IMPORTANTE: Siempre filtrar por `empresa_id` (multitenancy)

- [ ] **2.2. Repository: Categorías**
  - `src/repositories/categorias.repository.js`
  - Métodos:
    - `findByObraId(obraId)`
    - `createDefaults(obraId, porcentajes)` → Crear 3 categorías automáticas

- [ ] **2.3. Service: Obras**
  - `src/services/obras.service.js`
  - Lógica:
    - `crearObra(obraData, usuarioId)`
      - Validar suma de porcentajes = 100%
      - Crear obra
      - Crear 3 categorías (Materiales, Nómina, Herramienta)
      - Crear fondo_garantia
      - Crear caja_chica
    - `obtenerObras(empresaId, filtros)`
    - `obtenerObraPorId(id, empresaId)`
    - `actualizarObra(id, datos, empresaId)`
    - `eliminarObra(id, empresaId)`

- [ ] **2.4. Validator: Obras**
  - `src/validators/obras.validator.js`
  - Esquema Joi para validar:
    - nombre (requerido, string, min 3 caracteres)
    - porcentaje_materiales + nomina + herramienta = 100
    - fechas (formato ISO)

- [ ] **2.5. Controller: Obras**
  - `src/controllers/obras.controller.js`
  - Endpoints:
    - `GET /api/obras` → Listar
    - `GET /api/obras/:id` → Detalle
    - `POST /api/obras` → Crear
    - `PUT /api/obras/:id` → Actualizar
    - `DELETE /api/obras/:id` → Soft delete

- [ ] **2.6. Routes: Obras**
  - `src/routes/obras.routes.js`
  - Aplicar middleware `requireAuth()`
  - Registrar en `app.js`

**Día 6 - Sesión 6: Testing Módulo Obras**

- [ ] **2.7. Test: CRUD Obras**
  - `tests/integration/obras.test.js`
  - Casos:
    - Crear obra exitosa (con JWT de Admin)
    - Validar que se crean categorías automáticas
    - Validar porcentajes suma 100%
    - Auxiliar NO puede eliminar obra (RBAC)
    - Listar obras solo de la empresa del usuario

**Entregable Fase 2:**
- ✅ CRUD de obras completo
- ✅ Categorías se crean automáticamente
- ✅ Validaciones funcionando
- ✅ RBAC aplicado
- ✅ Tests pasando

---

## 📅 FASE 3: Módulo Estimaciones

### ✅ Checklist de Tareas

**Día 7-8 - Sesión 7-8: Motor Financiero**

- [ ] **3.1. Service: Financial Calculator**
  - `src/services/financial.service.js`
  - Función: `calcularDistribucion(montoBruto, porcentajeRetencion, porcentajes, subcontratos)`
  - Fórmula Maestra:
    ```javascript
    monto_base = monto_bruto / 1.16
    iva = monto_bruto - monto_base
    retencion = monto_base * (porcentaje_retencion / 100)
    costo_directo = monto_base - retencion
    base_repartible = costo_directo - total_subcontratos
    asignado_materiales = base_repartible * (porcentaje_materiales / 100)
    // etc...
    ```
  - Tests unitarios obligatorios

- [ ] **3.2. Repository: Estimaciones**
  - `src/repositories/estimaciones.repository.js`
  - Métodos:
    - `findByObraId(obraId, filtros)`
    - `findById(id)`
    - `create(estimacionData)`
    - `updateEstado(id, nuevoEstado, usuarioId)`
  - Query complejo con JOINs (obra, contrato)

- [ ] **3.3. Service: Estimaciones**
  - `src/services/estimaciones.service.js`
  - Lógica:
    - `crearEstimacion(datos, usuarioId)`
      - Calcular montos con FinancialService
      - Estado inicial: BORRADOR
      - Subir archivos (XML/PDF)
    - `cambiarEstado(id, nuevoEstado, usuarioId)`
      - Validar flujo: BORRADOR → EN_REVISION → APROBADA → COBRADA
      - Si APROBADA → Distribuir dinero a categorías (transaction)
      - Actualizar fondo_garantia

- [ ] **3.4. Controller: Estimaciones**
  - `src/controllers/estimaciones.controller.js`
  - Endpoints:
    - `GET /api/estimaciones?obra_id=...`
    - `POST /api/estimaciones`
    - `PATCH /api/estimaciones/:id/estado`

- [ ] **3.5. Middleware: Upload Archivos**
  - `src/middleware/upload.js`
  - Usar `multer` para multipart/form-data
  - Validar tipos de archivo (PDF, XML)
  - Límite de tamaño: 10MB

**Día 9 - Sesión 9: Transacciones y Triggers Simulados**

- [ ] **3.6. Service: Transacciones**
  - Crear helper para transacciones MySQL
  - Ejemplo:
    ```javascript
    async function distribuirDinero(estimacionId, connection) {
      await connection.beginTransaction();
      try {
        // Actualizar categorias.saldo_actual
        // Actualizar fondo_garantia
        // Cambiar estado estimación
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    }
    ```

- [ ] **3.7. Test: Fórmula Financiera**
  - `tests/unit/financial.service.test.js`
  - Casos:
    - monto_bruto $580,000 → validar cada cálculo
    - Con subcontratos → validar base_repartible
    - Decimales exactos (2 decimales)

- [ ] **3.8. Test: Flujo de Aprobación**
  - `tests/integration/estimaciones.test.js`
  - Casos:
    - BORRADOR → EN_REVISION (Auxiliar puede)
    - EN_REVISION → APROBADA (Solo Admin)
    - Al aprobar, verificar que categorias.saldo_actual se actualiza

**Entregable Fase 3:**
- ✅ Fórmula financiera validada
- ✅ Flujo de estados funcionando
- ✅ Distribución automática a categorías
- ✅ Fondo de garantía actualizado
- ✅ Transacciones seguras
- ✅ Tests pasando

---

## 📅 FASE 4: Módulo Gastos

### ✅ Checklist de Tareas

**Día 10-11 - Sesión 10-11: CRUD Gastos**

- [ ] **4.1. Repository: Gastos**
  - `src/repositories/gastos.repository.js`
  - Métodos:
    - `findByObraId(obraId, filtros, pagination)`
    - `findById(id)`
    - `create(gastoData, connection)` → Con transacción
    - `update(id, gastoData)`
    - `softDelete(id, connection)` → Con transacción

- [ ] **4.2. Service: Gastos**
  - `src/services/gastos.service.js`
  - Lógica:
    - `crearGasto(datos, usuarioId)`
      - Validar saldo (permitir negativo pero alertar)
      - Restar de categorias.saldo_actual (en transacción)
      - Si es_caja_chica → validar y restar de caja_chica
      - Insertar en logs_sistema
    - `eliminarGasto(id)`
      - Soft delete
      - Devolver monto a categoría (en transacción)

- [ ] **4.3. Controller: Gastos**
  - `src/controllers/gastos.controller.js`
  - Endpoints:
    - `GET /api/gastos?obra_id=...&categoria_id=...&page=1&limit=50`
    - `POST /api/gastos`
    - `PUT /api/gastos/:id`
    - `DELETE /api/gastos/:id`

- [ ] **4.4. Feature: Gastos Personales (Shadow Expenses)**
  - Agregar flag `is_personal` en request
  - Si `is_personal = true`:
    - Restar de categoría (para cuadrar cuenta)
    - Marcar en BD
    - Excluir de reportes de costos

- [ ] **4.5. Feature: Paginación**
  - Implementar paginación en repository
  - Respuesta estándar:
    ```json
    {
      "data": [...],
      "pagination": {
        "total": 248,
        "page": 1,
        "limit": 50,
        "pages": 5
      }
    }
    ```

**Día 12 - Sesión 12: Testing Gastos**

- [ ] **4.6. Test: CRUD Gastos**
  - `tests/integration/gastos.test.js`
  - Casos:
    - Crear gasto normal → verificar saldo se resta
    - Crear gasto personal → verificar flag
    - Eliminar gasto → verificar saldo se devuelve
    - Paginación funciona

- [ ] **4.7. Test: Validación de Saldos**
  - Crear gasto con saldo insuficiente → permitir (semáforo rojo)
  - Verificar logs_sistema se crean

**Entregable Fase 4:**
- ✅ CRUD de gastos completo
- ✅ Gastos personales funcionando
- ✅ Saldos de categorías actualizados
- ✅ Paginación implementada
- ✅ Tests pasando

---

## 📅 FASE 5: Módulo Subcontratos

**Día 13 - Sesión 13: Subcontratos**

- [ ] **5.1. Repository: Subcontratos**
  - CRUD básico
  - `create()` → Restar de base_repartible
  - `registrarPago()` → Actualizar monto_pagado

- [ ] **5.2. Service: Subcontratos**
  - Lógica para recalcular límites de categorías cuando se crea subcontrato
  - Validar que no exceda costo_directo disponible

- [ ] **5.3. Controller & Routes**
  - Endpoints completos
  - POST /api/subcontratos/:id/pagos

- [ ] **5.4. Test: Subcontratos**
  - Verificar recálculo de categorías

**Entregable Fase 5:**
- ✅ Subcontratos afectan distribución
- ✅ Pagos registrados

---

## 📅 FASE 6: Módulo Caja Chica

**Día 14 - Sesión 14: Caja Chica**

- [ ] **6.1. Repository: Caja Chica**
- [ ] **6.2. Service: Caja Chica**
  - Reposición (transacción)
  - Gasto de caja chica
- [ ] **6.3. Controller & Routes**
- [ ] **6.4. Test: Caja Chica**

**Entregable Fase 6:**
- ✅ Caja chica funcionando

---

## 📅 FASE 7: Sincronización Offline

**Día 15-18 - Sesión 15-18: Sistema de Sync**

- [ ] **7.1. Repository: Sync**
  - `procesarOperacion()`
  - `crearConflicto()`
  - `obtenerCambios()`

- [ ] **7.2. Service: Sync**
  - Operational Transformation
  - Detección de conflictos
  - Resolución de conflictos

- [ ] **7.3. Controller: Sync**
  - POST /api/sync/push
  - GET /api/sync/pull
  - GET /api/sync/conflicts
  - POST /api/sync/conflicts/:id/resolve

- [ ] **7.4. Test: Sync**
  - Escenarios de conflicto
  - OT funciona correctamente

**Entregable Fase 7:**
- ✅ Sincronización offline completa

---

## 📅 FASE 8: Reportes

**Día 19 - Sesión 19: Dashboards**

- [ ] **8.1. Repository: Reportes**
  - Queries complejos con vistas
  - Agregaciones

- [ ] **8.2. Service: Reportes**
- [ ] **8.3. Controller: Reportes**
  - GET /api/reportes/dashboard
  - GET /api/reportes/gastos-por-categoria

**Entregable Fase 8:**
- ✅ Reportes funcionando

---

## 📅 FASE 9: Testing & Docs

**Día 20-21 - Sesión 20-21**

- [ ] **9.1. Coverage de Tests**
  - Alcanzar >80% coverage
  - `npm run test:coverage`

- [ ] **9.2. Postman Collection**
  - Importar spec OpenAPI
  - Tests automatizados

- [ ] **9.3. README Completo**
  - Instalación
  - Configuración
  - API Docs

**Entregable Fase 9:**
- ✅ Tests completos
- ✅ Documentación lista

---

## 📅 FASE 10: Deploy

**Día 22-23 - Sesión 22-23**

- [ ] **10.1. Dockerfile**
- [ ] **10.2. CI/CD (GitHub Actions)**
- [ ] **10.3. Monitoring (opcional)**

---

## 🎯 Metodología de Trabajo

### Git Workflow (Feature Branch)

```bash
# Crear rama para nueva feature
git checkout -b feature/auth-login

# Hacer commits atómicos
git commit -m "feat: add login endpoint"
git commit -m "test: add login integration tests"

# Merge a main (o hacer PR)
git checkout main
git merge feature/auth-login
git push origin main
```

### Commits Semánticos

```
feat: nueva funcionalidad
fix: corrección de bug
test: agregar/modificar tests
docs: documentación
refactor: refactorización sin cambio funcional
style: formato de código
chore: tareas de mantenimiento
```

### Testing Continuo

- Correr tests antes de cada commit
- `npm test` debe pasar siempre
- Coverage mínimo: 70%

---

## 📝 Entregables por Fase

Cada fase debe terminar con:
1. ✅ Código funcional
2. ✅ Tests pasando
3. ✅ Commit en Git con mensaje descriptivo
4. ✅ README actualizado (si aplica)

---

## 🚀 ¿Listo para empezar?

**Siguiente paso:** Iniciar FASE 0 - Setup Inicial del Proyecto

¿Quieres que comience con la Fase 0 ahora mismo? Te voy a generar:
1. Estructura de carpetas completa
2. package.json configurado
3. .env.example
4. docker-compose.yml
5. Server.js básico
6. Scripts de Git

¿Procedemos?
