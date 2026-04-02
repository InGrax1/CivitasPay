# CivitasPay - Notas Técnicas de Base de Datos

## 📋 Decisiones de Diseño Críticas

### 1. UUIDs como Primary Keys (CHAR(36))

**¿Por qué?**
```
Escenario sin UUID:
- Residente (obra, sin internet) crea gasto → ID: 5
- Admin (oficina, con internet) crea gasto → ID: 5
- Sincronización → ❌ COLISIÓN

Escenario con UUID:
- Residente genera: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
- Admin genera: f47ac10b-58cc-4372-a567-0e02b2c3d479
- Sincronización → ✅ SIN PROBLEMAS
```

**Costo:**
- 36 bytes vs 4 bytes (INT)
- Trade-off aceptable para offline-first

**Implementación en código:**
```javascript
// Backend Node.js
const { v4: uuidv4 } = require('uuid');
const nuevoGasto = {
  id: uuidv4(), // a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
  concepto: 'Cemento',
  monto: 5000
};
```

---

### 2. Soft Delete (deleted_at) - PROHIBIDO DELETE FÍSICO

**Regla de oro:** Nunca ejecutar `DELETE FROM gastos WHERE id = '...'`

**Razón:**
- **Auditoría:** Los logs necesitan rastrear TODO
- **Regulatorio:** En caso de auditoría fiscal, necesitas demostrar cada movimiento
- **Sync offline:** Si borras un registro que está en cola de sincronización en otro dispositivo, se rompe todo

**Implementación:**
```sql
-- ❌ NUNCA hacer esto:
DELETE FROM gastos WHERE id = '123';

-- ✅ Hacer esto:
UPDATE gastos SET deleted_at = NOW() WHERE id = '123';
```

**En las consultas:**
```sql
-- Siempre filtrar registros activos
SELECT * FROM gastos WHERE deleted_at IS NULL;

-- Para reportes de "eliminados":
SELECT * FROM gastos WHERE deleted_at IS NOT NULL;
```

---

### 3. Índices Estratégicos

**Creados para KPI: Consultas < 2 segundos**

```sql
-- Sin índice (tabla con 100,000 gastos):
SELECT * FROM gastos WHERE obra_id = 'abc';
-- ⏱️ 4.5 segundos (Full Table Scan)

-- Con índice:
INDEX idx_gastos_obra (obra_id)
-- ⏱️ 0.03 segundos (Index Seek)
```

**Índices críticos creados:**
1. `obra_id` en TODAS las tablas transaccionales (multitenancy)
2. `fecha_gasto`, `fecha_estimacion` (filtros de reportes)
3. `sync_status` (para cola de sincronización)
4. `deleted_at` (filtrar activos vs eliminados)

**Advertencia:** No crear índices en TODO. Cada índice ralentiza los INSERT/UPDATE.

---

### 4. Motor Financiero - Triggers Automáticos

**Problema que resuelven:**
Sin triggers, el desarrollador debe recordar actualizar saldos manualmente:

```javascript
// ❌ Código frágil (humano puede olvidarlo):
await db.insert('gastos', { monto: 1000, categoria_id: 'mat-1' });
// ¿Olvidaste actualizar categorias.saldo_actual? 💥

await db.update('categorias', { 
  saldo_actual: saldo_actual - 1000 
}, { id: 'mat-1' });
```

**Solución con Trigger:**
```sql
CREATE TRIGGER trg_gastos_after_insert
AFTER INSERT ON gastos
FOR EACH ROW
BEGIN
    UPDATE categorias 
    SET saldo_actual = saldo_actual - NEW.monto
    WHERE id = NEW.categoria_id;
END;
```

Ahora el código del backend es:
```javascript
// ✅ El trigger se encarga automáticamente:
await db.insert('gastos', { monto: 1000, categoria_id: 'mat-1' });
// ✓ categorias.saldo_actual se actualiza solo
```

**Triggers implementados:**
1. `trg_gastos_after_insert` → Resta saldo de categoría
2. `trg_gastos_after_delete` → Devuelve saldo si se borra
3. `trg_gastos_log_insert` → Registra en logs_sistema
4. `trg_estimaciones_after_update` → Distribuye dinero a categorías cuando se aprueba

---

### 5. ENUM vs VARCHAR - Validación a Nivel DB

**Ejemplo:**
```sql
estado ENUM('BORRADOR', 'EN_REVISION', 'APROBADA', 'COBRADA')
```

**Ventaja:**
```sql
-- ❌ Esto falla automáticamente:
INSERT INTO estimaciones (estado) VALUES ('PENDIENTE');
-- Error: Data truncated for column 'estado'

-- ✅ Solo acepta valores válidos
```

**Sin ENUM (VARCHAR):**
```javascript
// Backend tiene que validar manualmente:
if (!['BORRADOR', 'EN_REVISION', 'APROBADA', 'COBRADA'].includes(estado)) {
  throw new Error('Estado inválido');
}
```

**Desventaja:** Si necesitas agregar un nuevo estado, requiere un ALTER TABLE (vs solo cambiar código).

**Decisión:** Usamos ENUM porque los estados de CivitasPay están grabados en piedra (reglas de negocio).

---

### 6. JSON Fields - Casos de Uso

**Usado en:**
- `roles.permisos` → Array dinámico: `["crear_obras", "ver_reportes"]`
- `gastos.tags` → Etiquetas flexibles: `["urgente", "electricidad"]`
- `logs_sistema.snapshot_before/after` → Estado completo del registro

**¿Por qué no tablas normalizadas?**

```sql
-- Opción 1: Tabla normalizada (NO elegida)
CREATE TABLE rol_permisos (
  rol_id CHAR(36),
  permiso VARCHAR(50)
);
-- Problema: Requiere JOINs complejos para leer permisos

-- Opción 2: JSON (✓ elegida)
roles.permisos = '["crear_obras", "ver_reportes"]'
-- Ventaja: 1 sola consulta, fácil de leer en código
```

**Implementación:**
```javascript
// Backend Node.js
const rol = await db.query('SELECT * FROM roles WHERE id = ?', [rolId]);
const permisos = JSON.parse(rol.permisos); // Array de strings

if (permisos.includes('*') || permisos.includes('crear_obras')) {
  // Usuario tiene permiso
}
```

---

### 7. Versionado para Sync Offline

**Tabla gastos:**
```sql
version INT DEFAULT 1,
sync_status ENUM('PENDIENTE', 'SINCRONIZADO', 'CONFLICTO')
```

**Flujo de Operational Transformation:**

```
1. Estado inicial en nube:
   saldo_categoria_materiales = $10,000 (version: 5)

2. Admin (online) gasta $2,000:
   - Genera operación: { accion: 'RESTAR', monto: 2000 }
   - Nube ejecuta: $10,000 - $2,000 = $8,000 (version: 6)

3. Residente (offline) gasta $1,500:
   - Genera operación local: { accion: 'RESTAR', monto: 1500 }
   - Guarda en IndexedDB con version_base: 5

4. Residente se conecta:
   - Envía operación al servidor
   - Servidor detecta: version_base (5) < version_nube (6)
   - Servidor aplica operación sobre versión actual:
     $8,000 - $1,500 = $6,500 (version: 7)
   
✅ Resultado correcto: $6,500 (ambos gastos contabilizados)
```

**Sin versionado:**
```
Residente envía: "El saldo es $8,500" (10,000 - 1,500)
Servidor sobrescribe → ❌ Se pierden los $2,000 del Admin
```

---

### 8. Pool de Conexiones (config/database.js)

**❌ No hacer esto:**
```javascript
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'civitaspay'
});

// Problema: Si la app está idle por >8 horas,
// MySQL cierra la conexión → Error "Connection lost"
```

**✅ Hacer esto:**
```javascript
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Máximo 10 conexiones simultáneas
  queueLimit: 0
});

module.exports = pool;
```

**Ventajas del Pool:**
- Auto-reconexión si se cae una conexión
- Reutiliza conexiones (más rápido)
- Maneja múltiples usuarios simultáneos

---

### 9. Seguridad - Variables de Entorno (.env)

**❌ NUNCA hacer esto en el código:**
```javascript
const password = 'admin123'; // Visible en GitHub
```

**✅ Usar .env:**
```bash
# .env (este archivo NO se sube a Git)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=admin123
DB_NAME=civitaspay
JWT_SECRET=mi_clave_super_secreta_2026
```

```javascript
// Backend
require('dotenv').config();
const password = process.env.DB_PASSWORD; // Leído de .env
```

**.gitignore:**
```
.env
node_modules/
```

---

### 10. Multitenancy Lógico

**Todas las consultas DEBEN filtrar por obra_id:**

```javascript
// ✅ Correcto:
const gastos = await db.query(
  'SELECT * FROM gastos WHERE obra_id = ? AND deleted_at IS NULL',
  [obraId]
);

// ❌ Peligroso (trae gastos de TODAS las obras):
const gastos = await db.query(
  'SELECT * FROM gastos WHERE deleted_at IS NULL'
);
```

**Middleware de seguridad (Express):**
```javascript
// Validar que el usuario tenga acceso a esa obra
app.use('/api/gastos', async (req, res, next) => {
  const { obra_id } = req.body;
  const usuario = req.user; // Del JWT
  
  const acceso = await db.query(
    'SELECT 1 FROM obras WHERE id = ? AND empresa_id = ?',
    [obra_id, usuario.empresa_id]
  );
  
  if (!acceso.length) {
    return res.status(403).json({ error: 'Acceso denegado a esta obra' });
  }
  
  next();
});
```

---

## 🔒 Reglas de Integridad Referencial

### Cascadas (ON DELETE CASCADE):
- `empresas` → `obras`: Si borras una empresa, se borran sus obras
- `obras` → `gastos`: Si borras una obra, se borran sus gastos

### Restricciones (ON DELETE RESTRICT):
- `categorias` → `gastos`: NO puedes borrar una categoría si tiene gastos

### Nullables (ON DELETE SET NULL):
- `usuarios` → `gastos.created_by`: Si borras un usuario, los gastos quedan con created_by = NULL

---

## 📊 Vistas Materializadas (Reportes Rápidos)

**Vista: v_resumen_obras**
```sql
SELECT * FROM v_resumen_obras WHERE obra_id = 'abc';
```

Devuelve:
```json
{
  "obra_nombre": "Torre Polanco",
  "total_ingresos": 1500000.00,
  "total_egresos": 980000.00,
  "saldo_obra": 520000.00,
  "num_estimaciones": 3,
  "num_gastos": 142
}
```

**Beneficio:** En lugar de hacer 5 JOINs cada vez, la vista ya los tiene pre-calculados.

---

## 🧪 Testing de la Base de Datos

### Script de validación:
```sql
-- 1. Verificar que triggers funcionen
INSERT INTO gastos (id, obra_id, categoria_id, concepto, monto, fecha_gasto, created_by)
VALUES (UUID(), 'obra-1', 'cat-1', 'Prueba Trigger', 100.00, CURDATE(), 'user-1');

SELECT saldo_actual FROM categorias WHERE id = 'cat-1';
-- Debe haberse restado 100.00

-- 2. Verificar soft delete
UPDATE gastos SET deleted_at = NOW() WHERE concepto = 'Prueba Trigger';

SELECT saldo_actual FROM categorias WHERE id = 'cat-1';
-- Debe haber regresado los 100.00

-- 3. Verificar logs
SELECT * FROM logs_sistema WHERE tabla_afectada = 'gastos' ORDER BY timestamp DESC LIMIT 1;
-- Debe mostrar el INSERT
```

---

## 📝 Checklist antes de Production

- [ ] Cambiar contraseña de MySQL (no usar 'root'/'')
- [ ] Crear usuario dedicado: `CREATE USER 'civitaspay'@'localhost' IDENTIFIED BY '...'`
- [ ] Configurar SSL/TLS para conexión a DB
- [ ] Habilitar slow query log para detectar consultas lentas
- [ ] Configurar backups automáticos (mysqldump diario)
- [ ] Agregar índice FULLTEXT si se implementa búsqueda por texto
- [ ] Validar que `innodb_buffer_pool_size` sea adecuado (50-70% RAM del servidor)

---

## 🚀 Siguiente Paso

Con este esquema listo, el siguiente paso es:
1. Ejecutar `civitaspay_schema.sql` en tu MySQL local
2. Crear el archivo de configuración `.env`
3. Crear el archivo `config/database.js` con el pool de conexiones
4. Implementar el primer endpoint: `POST /api/obras`
