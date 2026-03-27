# Guía Rápida para Desarrolladores - CivitasPay Backend

**Para:** Nuevos desarrolladores uniéndose al proyecto  
**Tiempo estimado de lectura:** 10 minutos  
**Última actualización:** 27 de Marzo, 2026

---

## 🎯 Lo que necesitas saber en 5 minutos

### 1. ¿Qué es CivitasPay?

Sistema financiero para constructoras que funciona **sin internet** en obras remotas.

**Stack:**
- Backend: Node.js + Express + MySQL
- Frontend: Angular (carpeta separada)
- Arquitectura: Clean Architecture (Controllers → Services → Repositories)

---

### 2. Configuración Inicial (Primera vez)

```bash
# 1. Clonar repo
git clone https://github.com/tu-usuario/civitaspay-backend.git
cd civitaspay-backend

# 2. Instalar dependencias
npm install

# 3. Configurar .env
cp .env.example .env
# Editar .env con tus valores

# 4. Crear base de datos
mysql -u root -p < scripts/CivitasPay.sql

# 5. Crear usuario admin
curl -X POST http://localhost:3000/api/seed/admin

# 6. Iniciar servidor
npm run dev
```

**Listo.** El servidor está en `http://localhost:3000`

---

### 3. Estructura de Carpetas (Lo importante)

```
src/
├── controllers/    ← HTTP requests/responses (NO lógica aquí)
├── services/       ← Lógica de negocio (TODO aquí)
├── repositories/   ← Queries SQL (SOLO SQL aquí)
├── middleware/     ← auth, RBAC, rate limiting
└── routes/         ← Definir endpoints
```

**Regla de oro:** Controller llama a Service, Service llama a Repository.

---

### 4. Agregar un Nuevo Endpoint (Ejemplo: GET /api/obras)

#### Paso 1: Repository (SQL)

```javascript
// src/repositories/obras.repository.js
const { pool } = require('../config/database');

async function findAll(empresaId) {
  const [rows] = await pool.query(`
    SELECT * FROM obras 
    WHERE empresa_id = ? 
      AND deleted_at IS NULL
  `, [empresaId]);
  
  return rows;
}

module.exports = { findAll };
```

#### Paso 2: Service (Lógica)

```javascript
// src/services/obras.service.js
const obrasRepository = require('../repositories/obras.repository');

async function obtenerObras(empresaId) {
  const obras = await obrasRepository.findAll(empresaId);
  
  // Procesar datos si es necesario
  return {
    total: obras.length,
    obras: obras
  };
}

module.exports = { obtenerObras };
```

#### Paso 3: Controller (HTTP)

```javascript
// src/controllers/obras.controller.js
const obrasService = require('../services/obras.service');

async function listar(req, res) {
  try {
    const empresaId = req.user.empresa_id; // Del JWT
    const resultado = await obrasService.obtenerObras(empresaId);
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = { listar };
```

#### Paso 4: Routes (Endpoint)

```javascript
// src/routes/obras.routes.js
const express = require('express');
const router = express.Router();
const obrasController = require('../controllers/obras.controller');
const { verificarJWT } = require('../middleware/auth');

router.get('/', verificarJWT, obrasController.listar);

module.exports = router;
```

#### Paso 5: Registrar en server.js

```javascript
// server.js
const obrasRoutes = require('./src/routes/obras.routes');

app.use(`${API_PREFIX}/obras`, obrasRoutes);
```

**Listo.** Ahora funciona: `GET http://localhost:3000/api/obras`

---

### 5. Testing con Thunder Client (VS Code)

**Login:**
```
POST http://localhost:3000/api/auth/login
Body: { "email": "admin@civitaspay.com", "password": "Admin123!" }
```

**Copiar el token** de la respuesta.

**Usar el token:**
```
GET http://localhost:3000/api/obras
Headers: Authorization: Bearer <tu-token>
```

---

### 6. Comandos Útiles

```bash
# Iniciar servidor (auto-restart)
npm run dev

# Ver logs de MySQL (Docker)
docker-compose logs -f mysql

# Ejecutar tests
npm test

# Linter
npm run lint:fix

# Formatear código
npm run format
```

---

### 7. Convenciones de Código

#### Nombres de Archivos
```
usuarios.repository.js   ← Plural + repository
auth.service.js          ← Singular + service
obras.controller.js      ← Plural + controller
```

#### Nombres de Funciones
```
// Repositories (CRUD estándar)
findAll()
findById(id)
create(data)
update(id, data)
delete(id)

// Services (verbos de negocio)
obtenerObras()
crearEstimacion()
validarPermiso()
```

#### Commits
```
feat: Agregar endpoint de obras
fix: Corregir validación de email
docs: Actualizar README
test: Agregar tests de obras.service
```

---

### 8. Debugging

**Ver queries SQL:**

```javascript
// En cualquier repository
console.log('SQL:', sql);
console.log('Params:', params);
const [rows] = await pool.execute(sql, params);
```

**Ver contenido de JWT:**

```javascript
// En cualquier controller
console.log('Usuario del token:', req.user);
```

**Ver requests:**

```javascript
// Ya está configurado con morgan
// Aparece automáticamente en consola
```

---

### 9. Reglas Importantes

✅ **Siempre usar prepared statements:**

```javascript
// ✅ CORRECTO
pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);

// ❌ INCORRECTO (SQL Injection vulnerable)
pool.query(`SELECT * FROM usuarios WHERE id = '${id}'`);
```

✅ **Nunca devolver password_hash al cliente:**

```javascript
// ✅ CORRECTO
const { password_hash, ...usuarioSinPassword } = usuario;
res.json(usuarioSinPassword);

// ❌ INCORRECTO
res.json(usuario); // Incluye password_hash
```

✅ **Siempre filtrar por empresa_id (multitenancy):**

```javascript
// ✅ CORRECTO
WHERE obra_id = ? AND empresa_id = ?

// ❌ INCORRECTO (expone datos de otras empresas)
WHERE obra_id = ?
```

---

### 10. Errores Comunes y Soluciones

**Error:** `Cannot find module 'uuid'`

```bash
npm install uuid
```

**Error:** `Access denied for user`

```bash
# Editar .env con el password correcto
DB_PASSWORD=tu_password_real
```

**Error:** `Token expirado`

```javascript
// Usar el refresh token para renovar
POST /api/auth/refresh
Body: { "refreshToken": "..." }
```

**Error:** `Port 3000 already in use`

```bash
# Opción 1: Matar el proceso
lsof -ti:3000 | xargs kill -9

# Opción 2: Cambiar puerto en .env
PORT=3001
```

---

### 11. Recursos Útiles

**Documentación del Proyecto:**
- [README.md](README.md) - Instalación y overview
- [ARQUITECTURA.md](ARQUITECTURA.md) - Detalles técnicos
- [CHANGELOG.md](CHANGELOG.md) - Historial de cambios

**Documentación Externa:**
- [Express.js](https://expressjs.com/)
- [MySQL2](https://github.com/sidorares/node-mysql2)
- [JWT](https://jwt.io/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)

**Herramientas:**
- [Thunder Client](https://www.thunderclient.com/) - Testing API
- [MySQL Workbench](https://www.mysql.com/products/workbench/) - Visualizar BD
- [Postman](https://www.postman.com/) - Alternativa a Thunder Client

---

### 12. Próximos Pasos (Después de setup)

1. Lee [ARQUITECTURA.md](ARQUITECTURA.md) para entender el diseño
2. Explora los archivos en `src/`
3. Prueba los endpoints existentes con Thunder Client
4. Crea tu primera feature (ej: endpoint de gastos)
5. Escribe tests para tu feature
6. Abre un Pull Request

---

### 13. ¿Necesitas Ayuda?

**Preguntas frecuentes:**
- "¿Dónde pongo la lógica de negocio?" → Service
- "¿Dónde van las queries SQL?" → Repository
- "¿Cómo protejo un endpoint?" → Agregar middleware `verificarJWT`
- "¿Cómo limito por rol?" → Agregar middleware `soloAdmin`

**Contacto:**
- Email del equipo: dev@civitaspay.com
- Slack: #civitaspay-backend
- Documentación interna: Wiki del proyecto

---

## 🚀 Checklist de Tu Primer Día

- [ ] Clonar repositorio
- [ ] Instalar dependencias
- [ ] Configurar .env
- [ ] Crear base de datos
- [ ] Iniciar servidor exitosamente
- [ ] Hacer login con Thunder Client
- [ ] Leer README.md completo
- [ ] Explorar estructura src/
- [ ] Crear tu primer endpoint de prueba
- [ ] Hacer tu primer commit

---

**¡Bienvenido al equipo!** 🎉

Si tienes dudas, no dudes en preguntar. Es mejor preguntar que romper algo. 😊
