# Changelog - CivitasPay Backend

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-03-27

### 🎉 Lanzamiento Inicial - FASE 0 y FASE 1 Completadas

Este es el primer release funcional del backend de CivitasPay, con autenticación JWT completa y arquitectura Clean implementada.

---

## ✨ Features Implementadas

### Autenticación y Seguridad

#### JWT (JSON Web Tokens)
- **Access Tokens** con expiración de 15 minutos
- **Refresh Tokens** con expiración de 7 días
- Firmado con algoritmo HS256
- Payload incluye: id, email, empresa_id, rol, permisos
- Rotación de tokens implementada

#### Hash de Passwords
- Implementación con **bcrypt**
- 12 rounds de salt (balance seguridad/performance)
- Validación de fortaleza mínima (8 caracteres)
- Nunca almacenados en texto plano

#### Rate Limiting
- **Login:** 5 intentos cada 15 minutos
- **API General:** 100 requests cada 15 minutos
- **Operaciones Críticas:** 10 requests por hora
- Identificación por dirección IP
- Headers `RateLimit-*` en respuestas

#### Control de Acceso (RBAC)
- Middleware `verificarJWT` para autenticación
- Middleware `soloAdmin` para restricción por rol
- Middleware `soloAdminOAuxiliar` para múltiples roles
- Factory function `requierePermiso()` para permisos específicos
- Middleware `verificarEmpresa` para multitenancy

#### Logging y Auditoría
- IP tracking en cada login exitoso
- Registro de intentos fallidos de autenticación
- Campo `ultimo_login` en tabla usuarios
- Campo `ultimo_ip` para análisis de seguridad
- Preparado para tabla `logs_sistema` (próxima fase)

---

### Arquitectura y Código

#### Clean Architecture
- **Controllers:** Manejo de HTTP requests/responses
- **Services:** Lógica de negocio y reglas
- **Repositories:** Acceso a datos y queries SQL
- **Middleware:** Interceptores de requests
- **Routes:** Definición de endpoints

#### Base de Datos
- Pool de conexiones MySQL con `mysql2/promise`
- 10 conexiones simultáneas máximo
- Auto-reconexión en caso de pérdida de conexión
- Prepared statements en todas las queries
- Protección contra SQL Injection

#### Separación de Responsabilidades
```
Request → Middleware → Controller → Service → Repository → MySQL
```

Cada capa tiene una única responsabilidad y no conoce detalles de implementación de las demás.

---

### Endpoints Creados

#### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login con email/password | No |
| POST | `/api/auth/refresh` | Renovar access token | No |
| GET | `/api/auth/me` | Datos del usuario actual | Sí |
| POST | `/api/auth/logout` | Cerrar sesión (auditoría) | Sí |

#### Desarrollo (`/api/seed`) - Solo en NODE_ENV=development

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/seed/admin` | Crear usuario admin inicial |

#### Utilidades (Temporales)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tables` | Listar tablas de la BD |
| GET | `/api/roles` | Listar todos los roles |
| GET | `/api/roles/nombre/:nombre` | Buscar rol por nombre |
| GET | `/api/roles/verificar-permiso/:rol/:permiso` | Verificar permiso |

---

### Base de Datos

#### Tablas Creadas (20 tablas)
- ✅ empresas
- ✅ roles
- ✅ usuarios
- ✅ obras
- ✅ categorias
- ✅ contratos
- ✅ estimaciones
- ✅ gastos
- ✅ reembolsos
- ✅ subcontratos
- ✅ pagos_subcontratos
- ✅ caja_chica
- ✅ caja_chica_movimientos
- ✅ fondo_garantia
- ✅ archivos
- ✅ logs_sistema
- ✅ sync_conflicts
- ✅ cierres_mensuales
- ✅ v_resumen_obras (vista)
- ✅ v_gastos_por_categoria (vista)

#### Características de Diseño
- **UUIDs (CHAR(36))** como PKs para prevenir colisiones offline
- **Soft Delete** con campo `deleted_at`
- **Timestamps** automáticos: `created_at`, `updated_at`
- **Índices** optimizados en columnas frecuentemente consultadas
- **Foreign Keys** con integridad referencial
- **Triggers** para actualización automática de saldos (preparados)

---

### Módulos Implementados

#### 1. Authentication Service (`auth.service.js`)
**Responsabilidades:**
- Login de usuarios
- Generación de JWT tokens
- Renovación de access tokens
- Hash de passwords con bcrypt
- Verificación de tokens

**Métodos públicos:**
- `login(email, password, ip)` → { accessToken, refreshToken, usuario }
- `refreshAccessToken(refreshToken)` → { accessToken }
- `hashPassword(password)` → hash
- `verifyToken(token)` → payload decodificado

#### 2. Roles Service (`roles.service.js`)
**Responsabilidades:**
- Obtener y procesar roles
- Validación de permisos
- Parseo de JSON de permisos

**Métodos públicos:**
- `obtenerTodosLosRoles()` → { total, roles, stats }
- `buscarPorNombre(nombre)` → rol
- `tienePermiso(nombreRol, permiso)` → boolean

#### 3. Usuarios Repository (`usuarios.repository.js`)
**Responsabilidades:**
- CRUD de usuarios
- Queries SQL optimizadas
- JOINs con tabla roles

**Métodos públicos:**
- `findByEmail(email)` → usuario (con password_hash)
- `findById(id)` → usuario (sin password_hash)
- `updateLastLogin(id, ip)` → boolean
- `create(userData)` → id

#### 4. Roles Repository (`roles.repository.js`)
**Responsabilidades:**
- Consultas a tabla roles
- Prepared statements

**Métodos públicos:**
- `findAll()` → roles[]
- `findById(id)` → rol
- `findByNombre(nombre)` → rol

---

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
# Servidor
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=********
DB_NAME=civitaspay

# JWT
JWT_SECRET=********

# CORS
CORS_ORIGIN=http://localhost:4200
```

### Dependencias Instaladas

**Producción:**
- express@^4.18.2
- mysql2@^3.9.1
- dotenv@^16.4.5
- bcrypt@^5.1.1
- jsonwebtoken@^9.0.2
- express-rate-limit@^7.1.5
- uuid@^9.0.1

**Desarrollo:**
- nodemon@^3.0.3
- eslint@^8.56.0
- prettier@^3.2.4
- jest@^29.7.0
- supertest@^6.3.4

---

## 🐛 Bugs Conocidos

### Permisos Vacíos en Rol ADMINISTRADOR
**Descripción:** Al crear el usuario admin, el campo `permisos` viene vacío `[]` en lugar de `["*"]`.

**Causa:** La tabla `roles` tiene el campo `permisos` NULL o vacío.

**Solución Temporal:**
```sql
UPDATE roles 
SET permisos = '["*"]' 
WHERE nombre = 'ADMINISTRADOR';
```

**Estado:** Pendiente de arreglar en próximo commit.

---

## 📈 Mejoras Planificadas

### Próxima Fase (v1.1.0)

#### Módulo de Obras
- [ ] CRUD completo de obras
- [ ] Filtrado por empresa_id (multitenancy)
- [ ] Validaciones de negocio
- [ ] Endpoints protegidos con RBAC

#### Mejoras de Seguridad
- [ ] Validación de entrada con Joi
- [ ] Sanitización de datos
- [ ] Headers de seguridad (CSP, HSTS)
- [ ] HTTPS en producción

#### Developer Experience
- [ ] Instalación de nodemon (hot reload)
- [ ] Scripts npm mejorados
- [ ] Documentación de API con Swagger
- [ ] Colección de Postman/Thunder Client

#### Testing
- [ ] Tests unitarios de Services
- [ ] Tests de integración de API
- [ ] Coverage > 70%
- [ ] CI/CD con GitHub Actions

---

## 🎓 Lecciones Aprendidas

### Decisiones Técnicas

1. **¿Por qué bcrypt con 12 rounds?**
   - Balance entre seguridad y performance (~300ms por hash)
   - Resistente a ataques de fuerza bruta
   - Recomendado por OWASP

2. **¿Por qué Access Token de 15 min?**
   - Minimiza ventana de exposición si el token es robado
   - Refresh token permite renovación sin re-login
   - Balance entre seguridad y UX

3. **¿Por qué UUIDs en lugar de AUTO_INCREMENT?**
   - Previene colisiones en modo offline
   - No expone cantidad de registros
   - Facilita sincronización bidireccional

4. **¿Por qué Pool de Conexiones?**
   - Reutiliza conexiones (más rápido que crear/cerrar)
   - Soporta múltiples requests simultáneos
   - Auto-reconexión si se cae MySQL

---

## 🔒 Seguridad Implementada

### Medidas de Protección

✅ **Autenticación:**
- JWT con expiración
- Refresh tokens
- Hash bcrypt (12 rounds)

✅ **Autorización:**
- RBAC por middleware
- Validación de permisos por endpoint

✅ **Anti-Ataques:**
- Rate limiting por IP
- Prepared statements (SQL injection)
- CORS configurado

✅ **Auditoría:**
- IP logging
- Timestamp de último login
- Preparado para logs inmutables

✅ **Datos Sensibles:**
- Passwords hasheados
- JWT_SECRET en .env
- .env en .gitignore

---

## 📊 Métricas del Proyecto

### Líneas de Código
- **Total:** ~1,200 líneas
- **Productivo:** ~800 líneas
- **Comentarios:** ~400 líneas
- **Ratio comentarios:** 33%

### Archivos Creados
- **Controllers:** 2
- **Services:** 2
- **Repositories:** 2
- **Middleware:** 3
- **Routes:** 2
- **Config:** 1
- **Scripts SQL:** 1

### Cobertura de Tests
- **Actual:** 0% (tests pendientes)
- **Objetivo:** 70%

---

## 🙏 Agradecimientos

- Comunidad de Node.js por excelente documentación
- Express.js por framework robusto y minimalista
- MySQL por base de datos confiable y madura

---

## 📝 Notas de Desarrollo

### Comandos Útiles

```bash
# Iniciar servidor
node server.js

# Crear admin
curl -X POST http://localhost:3000/api/seed/admin

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@civitaspay.com","password":"Admin123!"}'

# Acceder a ruta protegida
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### Estructura de Commits

```
feat: Implementar autenticación JWT
fix: Corregir error en validación de email
docs: Actualizar README con instalación
test: Agregar tests de auth.service
refactor: Extraer lógica a service layer
style: Formatear código con Prettier
chore: Actualizar dependencias
```

---

**Autor:** Juan  
**Fecha de Release:** 27 de Marzo, 2026  
**Tiempo de Desarrollo:** 1 sesión intensiva  
**Estado:** ✅ Funcional y listo para FASE 2

---

[Unreleased]: https://github.com/tu-usuario/civitaspay-backend/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/tu-usuario/civitaspay-backend/releases/tag/v1.0.0
