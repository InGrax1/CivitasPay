# Arquitectura Técnica - CivitasPay Backend

**Documento para:** Desarrolladores, Arquitectos de Software, DevOps  
**Versión:** 1.0.0  
**Última actualización:** 27 de Marzo, 2026  
**Autor:** Equipo de Desarrollo CivitasPay

---

## 📋 Índice

1. [Visión General](#vision-general)
2. [Patrón Arquitectónico](#patron-arquitectonico)
3. [Flujo de Datos](#flujo-de-datos)
4. [Componentes del Sistema](#componentes-del-sistema)
5. [Modelo de Seguridad](#modelo-de-seguridad)
6. [Decisiones Técnicas](#decisiones-tecnicas)
7. [Patrones de Diseño](#patrones-de-diseno)
8. [Escalabilidad](#escalabilidad)

---

## 🎯 Visión General

CivitasPay Backend es una **API RESTful stateless** construida con Node.js/Express que implementa **Clean Architecture** para separar responsabilidades y facilitar mantenimiento.

### Principios Fundamentales

1. **Separation of Concerns:** Cada capa tiene una única responsabilidad
2. **Dependency Inversion:** Las capas superiores no dependen de implementaciones concretas
3. **Single Responsibility:** Cada módulo tiene un único motivo de cambio
4. **DRY (Don't Repeat Yourself):** Lógica reutilizable en Services
5. **Stateless:** No se guarda estado de sesión en el servidor

---

## 🏗️ Patrón Arquitectónico

### Clean Architecture (Arquitectura Hexagonal Simplificada)

```
┌───────────────────────────────────────────────────────┐
│                   HTTP/REST Interface                  │
│              (Express Router + Middleware)             │
└──────────────────────┬────────────────────────────────┘
                       │
                       ↓
┌───────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                    │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │           Controllers (Adaptadores)           │    │
│  │  • Reciben HTTP Request                       │    │
│  │  • Validan formato de entrada                 │    │
│  │  • Llaman a Services                          │    │
│  │  • Formatean HTTP Response                    │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
└──────────────────────┬────────────────────────────────┘
                       │
                       ↓
┌───────────────────────────────────────────────────────┐
│                   BUSINESS LAYER                       │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │              Services (Casos de Uso)          │    │
│  │  • Lógica de negocio                          │    │
│  │  • Cálculos (fórmula maestra)                 │    │
│  │  • Validaciones complejas                     │    │
│  │  • Orquestación de Repositories               │    │
│  │  • Transacciones                              │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
└──────────────────────┬────────────────────────────────┘
                       │
                       ↓
┌───────────────────────────────────────────────────────┐
│                 DATA ACCESS LAYER                      │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │          Repositories (Gateways)              │    │
│  │  • Ejecutan queries SQL                       │    │
│  │  • Prepared Statements                        │    │
│  │  • Transacciones DB                           │    │
│  │  • Mapeo de resultados                        │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
└──────────────────────┬────────────────────────────────┘
                       │
                       ↓
┌───────────────────────────────────────────────────────┐
│                  DATABASE (MySQL 8.0)                  │
│              20 Tablas + 2 Vistas + Triggers           │
└───────────────────────────────────────────────────────┘
```

### Ventajas de esta Arquitectura

✅ **Testeable:** Cada capa se puede testear independientemente  
✅ **Mantenible:** Cambios aislados en cada capa  
✅ **Escalable:** Fácil agregar nuevos módulos  
✅ **Reusable:** Services se pueden llamar desde múltiples Controllers  
✅ **Desacoplado:** Cambiar DB no afecta a Services/Controllers

---

## 🔄 Flujo de Datos

### Request → Response Completo

```
1. Cliente HTTP
      ↓
   [POST /api/auth/login]
      ↓
2. Express Router (routes/auth.routes.js)
      ↓
   Aplica middleware en orden:
      ↓
3. Rate Limiter Middleware (rateLimiter.js)
   • Verifica límite de requests
   • Si excede → 429 Too Many Requests
      ↓
4. Body Parser Middleware (express.json())
   • Parsea JSON del body
   • req.body = { email, password }
      ↓
5. Controller (auth.controller.js)
   • Extrae email y password de req.body
   • Obtiene IP del cliente (req.ip)
      ↓
6. Service (auth.service.js)
   • Valida que email y password no estén vacíos
   • Llama a Repository para obtener usuario
      ↓
7. Repository (usuarios.repository.js)
   • Ejecuta query SQL con prepared statement
   • SELECT ... FROM usuarios WHERE email = ?
      ↓
8. MySQL Database
   • Ejecuta query
   • Retorna row (si existe)
      ↓
9. Repository
   • Mapea row a objeto JavaScript
   • Retorna usuario con password_hash
      ↓
10. Service
   • Compara password con bcrypt.compare()
   • Si válido: Genera JWT tokens
   • Actualiza ultimo_login e IP
      ↓
11. Controller
   • Formatea respuesta JSON
   • Status 200 OK
      ↓
12. Express
   • Envía HTTP Response
      ↓
13. Cliente recibe:
    {
      "success": true,
      "accessToken": "...",
      "refreshToken": "...",
      "usuario": { ... }
    }
```

---

## 🧩 Componentes del Sistema

### 1. Controllers (Capa de Presentación)

**Responsabilidad:** Adaptar HTTP a lógica de negocio

**Reglas:**
- ✅ Recibir req, devolver res
- ✅ Validación básica de formato
- ✅ Extraer parámetros (body, params, query)
- ✅ Llamar a Services
- ✅ Formatear respuesta JSON
- ❌ NO lógica de negocio
- ❌ NO queries SQL directas

**Ejemplo:**

```javascript
// auth.controller.js
async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    // Validación básica
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y password son requeridos'
      });
    }
    
    // Obtener IP
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Llamar al Service (lógica de negocio)
    const resultado = await authService.login(email, password, ip);
    
    // Formatear respuesta
    res.json({
      success: true,
      message: 'Login exitoso',
      ...resultado
    });
  } catch (error) {
    // Manejo de errores
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
}
```

---

### 2. Services (Capa de Negocio)

**Responsabilidad:** Implementar reglas de negocio

**Reglas:**
- ✅ Validaciones complejas
- ✅ Cálculos (fórmula maestra)
- ✅ Orquestación de múltiples Repositories
- ✅ Transacciones que involucran varias tablas
- ✅ Procesamiento de datos
- ❌ NO conocer detalles de HTTP (req, res)
- ❌ NO queries SQL directas

**Ejemplo:**

```javascript
// auth.service.js
async function login(email, password, ip) {
  // 1. Buscar usuario
  const usuario = await usuariosRepository.findByEmail(email);
  
  if (!usuario) {
    throw new Error('Credenciales inválidas');
  }
  
  // 2. Verificar que esté activo
  if (!usuario.activo) {
    throw new Error('Usuario inactivo');
  }
  
  // 3. Comparar password
  const passwordValido = await bcrypt.compare(password, usuario.password_hash);
  
  if (!passwordValido) {
    throw new Error('Credenciales inválidas');
  }
  
  // 4. Actualizar último login
  await usuariosRepository.updateLastLogin(usuario.id, ip);
  
  // 5. Parsear permisos
  let permisos = [];
  try {
    permisos = JSON.parse(usuario.rol_permisos || '[]');
  } catch (e) {
    permisos = [];
  }
  
  // 6. Generar tokens
  const payload = {
    id: usuario.id,
    email: usuario.email,
    empresa_id: usuario.empresa_id,
    rol: usuario.rol_nombre,
    permisos: permisos
  };
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });
  
  const refreshToken = jwt.sign(
    { id: usuario.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // 7. Retornar resultado
  return {
    accessToken,
    refreshToken,
    expiresIn: '15m',
    usuario: {
      id: usuario.id,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      rol: usuario.rol_nombre,
      empresa_id: usuario.empresa_id,
      permisos: permisos
    }
  };
}
```

---

### 3. Repositories (Capa de Datos)

**Responsabilidad:** Abstraer acceso a la base de datos

**Reglas:**
- ✅ Ejecutar queries SQL
- ✅ Prepared statements SIEMPRE
- ✅ Mapear rows a objetos
- ✅ Transacciones simples (1 tabla)
- ❌ NO lógica de negocio
- ❌ NO validaciones complejas
- ❌ NO conocer de HTTP

**Ejemplo:**

```javascript
// usuarios.repository.js
async function findByEmail(email) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id,
        u.empresa_id,
        u.rol_id,
        u.nombre_completo,
        u.email,
        u.password_hash,
        u.activo,
        r.nombre as rol_nombre,
        r.permisos as rol_permisos
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.email = ?
        AND u.deleted_at IS NULL
    `, [email]);
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error en findByEmail:', error.message);
    throw error;
  }
}
```

---

### 4. Middleware (Capa de Interceptación)

**Responsabilidad:** Procesar requests antes de llegar al Controller

**Tipos implementados:**

#### a) Autenticación (`auth.js`)

```javascript
function verificarJWT(req, res, next) {
  // 1. Extraer token del header Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Token no proporcionado'
    });
  }
  
  // 2. Verificar formato: "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      error: 'Formato de token inválido'
    });
  }
  
  const token = parts[1];
  
  // 3. Verificar y decodificar token
  const decoded = authService.verifyToken(token);
  
  // 4. Agregar usuario al request
  req.user = decoded;
  
  // 5. Continuar al siguiente middleware o controller
  next();
}
```

#### b) RBAC (`rbac.js`)

```javascript
function soloAdmin(req, res, next) {
  // req.user fue agregado por verificarJWT
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'No autenticado'
    });
  }
  
  if (req.user.rol !== 'ADMINISTRADOR') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Solo administradores'
    });
  }
  
  next();
}
```

#### c) Rate Limiting (`rateLimiter.js`)

```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    success: false,
    error: 'Demasiados intentos de login'
  },
  keyGenerator: (req) => req.ip
});
```

---

## 🔒 Modelo de Seguridad

### 1. Autenticación (¿Quién eres?)

#### Flow de Login

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ POST /api/auth/login
       │ { email, password }
       ↓
┌─────────────────────────┐
│  Rate Limiter           │ ← Máximo 5 intentos
│  (15 min window)        │
└──────┬──────────────────┘
       ↓
┌─────────────────────────┐
│  Controller             │
│  • Extrae credenciales  │
│  • Obtiene IP           │
└──────┬──────────────────┘
       ↓
┌─────────────────────────┐
│  Service                │
│  • Busca usuario en DB  │
│  • bcrypt.compare()     │
│  • Valida activo        │
└──────┬──────────────────┘
       │
       ↓ (password válido)
┌─────────────────────────┐
│  Genera JWT             │
│  Payload:               │
│  • id                   │
│  • email                │
│  • empresa_id           │
│  • rol                  │
│  • permisos             │
│                         │
│  Firma con HS256        │
│  Secret: JWT_SECRET     │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  Respuesta              │
│  • accessToken (15 min) │
│  • refreshToken (7 días)│
│  • usuario (sin hash)   │
└──────┬──────────────────┘
       │
       ↓
┌─────────────┐
│   Cliente   │ → Guarda tokens en localStorage
└─────────────┘
```

#### Flow de Request Autenticado

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ GET /api/auth/me
       │ Header: Authorization: Bearer <token>
       ↓
┌─────────────────────────┐
│  Middleware: verificarJWT│
│  • Extrae token         │
│  • jwt.verify()         │
│  • Decodifica payload   │
│  • req.user = payload   │
└──────┬──────────────────┘
       ↓
┌─────────────────────────┐
│  Controller             │
│  • Lee req.user         │
│  • Ya sabe quién es     │
│  • Ejecuta lógica       │
└──────┬──────────────────┘
       ↓
┌─────────────┐
│  Respuesta  │
└─────────────┘
```

---

### 2. Autorización (¿Qué puedes hacer?)

#### RBAC (Role-Based Access Control)

```
┌──────────────────────────────────────┐
│         Tabla: roles                  │
├──────────────────────────────────────┤
│ ADMINISTRADOR                        │
│ permisos: ["*"]                      │
│                                      │
│ Puede hacer TODO                     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│         Tabla: roles                  │
├──────────────────────────────────────┤
│ AUXILIAR                             │
│ permisos: [                          │
│   "ver_obras",                       │
│   "crear_gastos",                    │
│   "crear_estimaciones"               │
│ ]                                    │
│                                      │
│ Puede crear pero NO eliminar         │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│         Tabla: roles                  │
├──────────────────────────────────────┤
│ RESIDENTE                            │
│ permisos: []                         │
│                                      │
│ Sin login (solo referencia)          │
└──────────────────────────────────────┘
```

#### Verificación de Permisos

```javascript
// Endpoint protegido con rol específico
app.delete(
  '/api/obras/:id',
  verificarJWT,           // ¿Tiene token válido?
  soloAdmin,              // ¿Es ADMINISTRADOR?
  obrasController.eliminar
);

// Endpoint con permiso específico
app.post(
  '/api/estimaciones',
  verificarJWT,
  requierePermiso('crear_estimaciones'),
  estimacionesController.crear
);
```

---

## 🎨 Patrones de Diseño Utilizados

### 1. Repository Pattern

**Problema:** Acoplar lógica de negocio con queries SQL.

**Solución:** Capa intermedia que abstrae el acceso a datos.

**Beneficio:** Cambiar de MySQL a PostgreSQL solo requiere modificar Repositories.

---

### 2. Factory Pattern

**Usado en:** `requierePermiso()`

```javascript
// Factory function que crea middleware dinámico
function requierePermiso(permisoRequerido) {
  return function(req, res, next) {
    const permisos = req.user.permisos || [];
    
    if (permisos.includes('*') || permisos.includes(permisoRequerido)) {
      return next();
    }
    
    res.status(403).json({
      success: false,
      error: `Se requiere permiso: ${permisoRequerido}`
    });
  };
}

// Uso:
app.post('/api/obras', verificarJWT, requierePermiso('crear_obras'), controller);
```

---

### 3. Middleware Chain Pattern

**Usado en:** Express.js

```javascript
app.post(
  '/api/auth/login',
  loginLimiter,           // Middleware 1
  authController.login    // Middleware 2 (final)
);

// Ejecución secuencial:
// Request → loginLimiter → authController.login → Response
```

---

### 4. Dependency Injection

**Usado en:** Controllers/Services/Repositories

```javascript
// auth.controller.js
const authService = require('../services/auth.service');

// auth.service.js
const usuariosRepository = require('../repositories/usuarios.repository');

// Beneficio: Fácil de testear con mocks
```

---

## 📈 Escalabilidad

### Horizontal Scaling

**Stateless Design** permite múltiples instancias:

```
┌─────────────┐
│ Load        │
│ Balancer    │
│ (NGINX)     │
└──────┬──────┘
       │
       ├─────────┬─────────┬─────────┐
       ↓         ↓         ↓         ↓
    ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
    │Node │  │Node │  │Node │  │Node │
    │  1  │  │  2  │  │  3  │  │  4  │
    └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘
       │        │        │        │
       └────────┴────────┴────────┘
                  ↓
            ┌──────────┐
            │  MySQL   │
            │  Master  │
            └────┬─────┘
                 │
        ┌────────┴────────┐
        ↓                 ↓
    ┌──────┐          ┌──────┐
    │Slave │          │Slave │
    │  1   │          │  2   │
    └──────┘          └──────┘
```

**Sin estado = Cualquier instancia puede manejar cualquier request**

---

### Caching Strategy

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│  Redis Cache    │ ← Tokens, Roles, Permisos
│  (TTL: 15 min)  │
└──────┬──────────┘
       │ (cache miss)
       ↓
┌─────────────────┐
│  Node.js API    │
└──────┬──────────┘
       ↓
┌─────────────────┐
│  MySQL          │
└─────────────────┘
```

**Próxima implementación:** Cache de roles y permisos en Redis.

---

## 🧪 Testing Strategy

### Pirámide de Tests

```
           ┌─────┐
          ╱       ╲
         ╱   E2E   ╲        ← 10% (Pocos, costosos)
        ╱───────────╲
       ╱             ╲
      ╱ Integration   ╲     ← 30% (Medianos)
     ╱─────────────────╲
    ╱                   ╲
   ╱   Unit Tests        ╲  ← 60% (Muchos, rápidos)
  ╱───────────────────────╲
```

### Ejemplos de Tests

**Unit Test (Service):**

```javascript
describe('auth.service', () => {
  test('login con credenciales válidas devuelve tokens', async () => {
    const resultado = await authService.login(
      'admin@civitaspay.com',
      'Admin123!',
      '127.0.0.1'
    );
    
    expect(resultado).toHaveProperty('accessToken');
    expect(resultado).toHaveProperty('refreshToken');
    expect(resultado.usuario.email).toBe('admin@civitaspay.com');
  });
});
```

**Integration Test (API):**

```javascript
describe('POST /api/auth/login', () => {
  test('devuelve 200 y tokens con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@civitaspay.com',
        password: 'Admin123!'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
  });
});
```

---

## 📚 Referencias

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Express.js Documentation](https://expressjs.com/)
- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)

---

**Documento vivo:** Este archivo se actualiza con cada cambio significativo en la arquitectura.

**Próxima revisión:** Tras completar FASE 2 (Módulo de Obras)
