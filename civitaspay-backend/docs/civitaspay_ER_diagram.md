```mermaid
erDiagram
    %% =====================================================
    %% CivitasPay - Diagrama Entidad-Relación
    %% =====================================================

    %% TABLAS MAESTRAS
    empresas ||--o{ usuarios : "tiene"
    empresas ||--o{ obras : "gestiona"
    
    roles ||--o{ usuarios : "asigna"
    
    usuarios ||--o{ obras : "responsable_de"
    usuarios ||--o{ gastos : "crea"
    usuarios ||--o{ estimaciones : "crea"
    usuarios ||--o{ contratos : "crea"
    usuarios ||--o{ subcontratos : "crea"
    
    %% OBRAS Y CATEGORÍAS
    obras ||--o{ categorias : "tiene"
    obras ||--o{ contratos : "pertenece"
    obras ||--o{ estimaciones : "genera"
    obras ||--o{ subcontratos : "contrata"
    obras ||--o{ gastos : "registra"
    obras ||--o{ caja_chica : "maneja"
    obras ||--o{ fondo_garantia : "acumula"
    obras ||--o{ cierres_mensuales : "cierra"
    obras ||--o{ archivos : "almacena"
    
    %% FLUJO FINANCIERO PRINCIPAL
    contratos ||--o{ estimaciones : "documenta"
    
    estimaciones {
        char36 id PK
        char36 obra_id FK
        char36 contrato_id FK
        int numero_estimacion
        decimal monto_bruto "Monto facturado"
        decimal monto_base "Bruto/1.16"
        decimal iva "Calculado"
        decimal retencion "Base*%"
        decimal costo_directo "Base-Retención"
        decimal asignado_materiales
        decimal asignado_nomina
        decimal asignado_herramienta
        decimal asignado_subcontratos
        date fecha_estimacion
        date fecha_cobro
        enum estado "BORRADOR,EN_REVISION,APROBADA,COBRADA"
    }
    
    categorias ||--o{ gastos : "clasifica"
    categorias ||--o{ reembolsos : "devuelve_a"
    categorias ||--o{ caja_chica_movimientos : "repone_desde"
    
    gastos ||--o{ reembolsos : "genera"
    gastos ||--o{ caja_chica_movimientos : "origina"
    
    %% SUBCONTRATOS
    subcontratos ||--o{ pagos_subcontratos : "recibe"
    
    subcontratos {
        char36 id PK
        char36 obra_id FK
        varchar proveedor
        varchar concepto
        decimal monto_total
        decimal monto_pagado
        decimal monto_pendiente
        enum estado "ACTIVO,PAUSADO,LIQUIDADO,CANCELADO"
    }
    
    %% CAJA CHICA
    caja_chica ||--o{ caja_chica_movimientos : "registra"
    
    caja_chica {
        char36 id PK
        char36 obra_id FK
        varchar nombre
        decimal saldo_actual
        decimal limite_maximo
        char36 responsable_id FK
    }
    
    caja_chica_movimientos {
        char36 id PK
        char36 caja_chica_id FK
        enum tipo "REPOSICION,GASTO,AJUSTE"
        decimal monto
        decimal saldo_anterior
        decimal saldo_nuevo
        char36 gasto_id FK
        char36 categoria_origen_id FK
    }
    
    %% GASTOS (TABLA CENTRAL)
    gastos {
        char36 id PK
        char36 obra_id FK
        char36 categoria_id FK
        varchar concepto
        varchar proveedor
        decimal monto
        date fecha_gasto
        boolean is_personal "Shadow Expense"
        boolean es_caja_chica
        varchar factura_numero
        enum sync_status "PENDIENTE,SINCRONIZADO,CONFLICTO"
        int version "Para sync offline"
    }
    
    %% FONDO DE GARANTÍA
    fondo_garantia {
        char36 id PK
        char36 obra_id FK
        decimal saldo_acumulado "Solo entrada (Sink)"
    }
    
    %% AUDITORÍA
    usuarios ||--o{ logs_sistema : "genera"
    
    logs_sistema {
        bigint id PK
        char36 usuario_id FK
        varchar tabla_afectada
        char36 registro_id
        enum accion "INSERT,UPDATE,DELETE,LOGIN,LOGOUT"
        json snapshot_before
        json snapshot_after
        timestamp timestamp
    }
    
    %% SINCRONIZACIÓN OFFLINE
    obras ||--o{ sync_conflicts : "tiene"
    usuarios ||--o{ sync_conflicts : "resuelve"
    
    sync_conflicts {
        char36 id PK
        char36 obra_id FK
        varchar tabla_afectada
        char36 registro_id
        int version_local
        int version_nube
        json datos_local
        json datos_nube
        boolean resuelto
        enum resolucion "GANA_NUBE,GANA_LOCAL,MERGE,DESCARTADO"
    }
    
    %% CIERRES CONTABLES
    cierres_mensuales {
        char36 id PK
        char36 obra_id FK
        varchar periodo "YYYY-MM"
        decimal total_ingresos
        decimal total_egresos
        decimal saldo_final
        json snapshot_categorias
        decimal snapshot_fondo_garantia
        boolean reabierto
        char36 reabierto_por FK
    }
```

## 📊 Explicación de Relaciones Clave:

### Flujo de Dinero (La Cascada):
```
CLIENTE paga → estimaciones (APROBADA)
    ├─> monto_bruto / 1.16 = monto_base
    ├─> monto_base * %retención → fondo_garantia ✓
    ├─> costo_directo - subcontratos = Base Repartible
    └─> Base Repartible se distribuye a:
        ├─> categorias[MATERIALES] ✓
        ├─> categorias[NOMINA] ✓
        └─> categorias[HERRAMIENTA] ✓

Usuario crea → gastos
    └─> Resta de categorias.saldo_actual (trigger automático)
```

### Multitenancy:
- Todas las tablas transaccionales tienen `obra_id`
- `obras` pertenece a `empresas`
- Filtros automáticos en cada consulta

### Offline-First:
- `gastos.sync_status` controla el estado de sincronización
- `sync_conflicts` almacena colisiones para resolución manual
- `version` permite Operational Transformation

### Auditoría (Caja Negra):
- `logs_sistema` registra TODO (triggers automáticos)
- `snapshot_before` y `snapshot_after` inmutables
- Soft delete en todas las entidades (`deleted_at`)
