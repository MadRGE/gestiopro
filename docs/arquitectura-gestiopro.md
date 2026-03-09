# GestioPro — Arquitectura del Sistema

> Documento tecnico para equipo de producto. Generado el 2026-03-08.
> Repo: github.com/MadRGE/gestiopro (public)
> Proposito: Gestion inteligente para negocios locales de barrio

---

## 1. Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | Next.js 16 (App Router) + React 19 + Tailwind CSS 4 |
| Componentes UI | shadcn/ui + Radix UI + Lucide Icons |
| Charts | Recharts |
| Backend | Next.js API Routes (serverless) |
| Base de datos | PostgreSQL (Neon, serverless) |
| ORM | Prisma 7 con @prisma/adapter-neon |
| Auth | NextAuth v5 (credentials + JWT) |
| Validacion | Zod 4 |
| Deploy | Vercel |

---

## 2. Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph "Cliente (Browser)"
        UI[React App<br/>Next.js App Router]
        POS[POS Interface<br/>Punto de Venta]
    end

    subgraph "Vercel (Cloud)"
        MW[Middleware<br/>Auth Guard]
        API[API Routes<br/>REST Endpoints]
        SSR[Server Components<br/>Dashboard, Reportes]
    end

    subgraph "Neon (Cloud)"
        DB[(PostgreSQL<br/>Multi-tenant)]
    end

    UI --> MW --> API
    POS --> API
    UI --> SSR
    API --> DB
    SSR --> DB

    style POS fill:#22c55e,color:#fff
    style DB fill:#3b82f6,color:#fff
```

---

## 3. Modulos del Sistema

```mermaid
graph LR
    subgraph "Operaciones"
        VENTAS[Ventas / POS]
        CAJA[Caja Registradora]
        CLIENTES[Clientes]
    end

    subgraph "Inventario"
        PROD[Productos]
        CAT[Categorias]
        PROV[Proveedores]
    end

    subgraph "Administracion"
        DASH[Dashboard KPIs]
        REP[Reportes]
        EMP[Empleados]
        CONF[Configuracion]
    end

    VENTAS -->|decrementa stock| PROD
    VENTAS -->|registra efectivo| CAJA
    VENTAS -->|asocia| CLIENTES
    PROD -->|pertenece a| CAT
    PROD -->|viene de| PROV
    DASH -->|lee| VENTAS & PROD
    REP -->|agrega| VENTAS
```

---

## 4. Esquema de Base de Datos

```mermaid
erDiagram
    Usuario ||--o| Negocio : "es dueno de"
    Negocio ||--o{ Producto : "tiene"
    Negocio ||--o{ Categoria : "define"
    Negocio ||--o{ Venta : "registra"
    Negocio ||--o{ Cliente : "tiene"
    Negocio ||--o{ Proveedor : "trabaja con"
    Negocio ||--o{ CajaSesion : "abre"
    Negocio }o--|| Rubro : "es tipo"

    Producto }o--o| Categoria : "pertenece a"
    Producto }o--o| Proveedor : "viene de"

    Venta ||--o{ ItemVenta : "contiene"
    Venta }o--|| Usuario : "vendedor"
    Venta }o--o| Cliente : "cliente"
    ItemVenta }o--|| Producto : "producto"

    CajaSesion ||--o{ MovimientoCaja : "tiene"
    CajaSesion }o--|| Usuario : "operador"

    Usuario {
        string id PK
        string email UK
        string nombre
        string passwordHash
        enum rol "DUENIO | EMPLEADO | ADMIN"
    }

    Negocio {
        string id PK
        string nombre
        string direccion
        string telefono
        string cuit
        string condicionFiscal
    }

    Rubro {
        string id PK
        string nombre "Kiosco Farmacia etc"
        json config "labels categoriasDefault"
    }

    Producto {
        string id PK
        string nombre
        string codigoBarras UK
        decimal precioCompra "12,2"
        decimal precioVenta "12,2"
        int stock
        int stockMinimo
        string unidad
        boolean activo
    }

    Venta {
        string id PK
        int numero "auto-increment por negocio"
        decimal total
        decimal descuento
        enum metodoPago "EFECTIVO DEBITO CREDITO TRANSFERENCIA QR"
        enum estado "COMPLETADA CANCELADA PENDIENTE"
        datetime creadoEl
    }

    ItemVenta {
        string id PK
        int cantidad
        decimal precioUnitario
        decimal subtotal
    }

    Cliente {
        string id PK
        string nombre
        string email
        string telefono
        string direccion
        boolean activo
    }

    Proveedor {
        string id PK
        string nombre
        string contacto
        string telefono
        string email
        string cbu
        enum condicionPago "CONTADO 30 60 90 DIAS"
    }

    CajaSesion {
        string id PK
        decimal montoInicial
        decimal montoFinal
        decimal diferencia
        enum estado "ABIERTA CERRADA"
        datetime abiertaEl
        datetime cerradaEl
    }

    MovimientoCaja {
        string id PK
        enum tipo "INGRESO EGRESO"
        decimal monto
        string concepto
    }

    Categoria {
        string id PK
        string nombre
        string color
        boolean activa
    }
```

---

## 5. Flujo de Venta (POS)

```mermaid
sequenceDiagram
    actor V as Vendedor
    participant POS as Interfaz POS
    participant API as /api/ventas
    participant DB as PostgreSQL

    V->>POS: Busca producto (nombre o codigo)
    POS->>POS: Agrega al carrito (cantidad, precio)
    V->>POS: Selecciona metodo de pago
    V->>POS: (Opcional) Selecciona cliente
    V->>POS: Click "Cobrar"

    POS->>API: POST /api/ventas
    Note right of API: {items[], metodoPago, clienteId, descuento}

    API->>API: Valida stock de cada producto
    alt Stock insuficiente
        API-->>POS: Error 400 "Stock insuficiente para [producto]"
    else Stock OK
        API->>DB: BEGIN TRANSACTION
        API->>DB: Auto-numera venta (max+1 por negocio)
        API->>DB: Crea Venta + ItemVenta[]
        API->>DB: Decrementa stock de cada producto
        API->>DB: COMMIT
        DB-->>API: Venta creada
        API-->>POS: 201 + venta con items
        POS->>POS: Navega a ticket (/ventas/[id]/ticket)
    end
```

---

## 6. Flujo de Caja Registradora

```mermaid
sequenceDiagram
    actor C as Cajero/Dueno
    participant UI as Interfaz Caja
    participant API as /api/caja
    participant DB as PostgreSQL

    Note over C,DB: Apertura
    C->>UI: Ingresa monto inicial
    UI->>API: POST /api/caja {montoInicial}
    API->>DB: Crea CajaSesion (ABIERTA)
    DB-->>UI: Sesion abierta

    Note over C,DB: Durante el dia
    C->>UI: Registra movimiento (ingreso/egreso)
    UI->>API: POST /api/caja/movimientos {tipo, monto, concepto}
    API->>DB: Crea MovimientoCaja

    Note over C,DB: Cierre
    C->>UI: Click "Cerrar Caja", ingresa monto final
    UI->>API: POST /api/caja/cerrar {montoFinal}
    API->>DB: Suma ventas en efectivo del dia
    API->>API: esperado = inicial + ventasEfectivo + ingresos - egresos
    API->>API: diferencia = montoFinal - esperado
    API->>DB: Actualiza sesion (CERRADA, diferencia)
    DB-->>UI: Reporte de cierre (sobrante/faltante)
```

---

## 7. Flujo de Autenticacion

```mermaid
sequenceDiagram
    actor U as Usuario
    participant LOGIN as /login
    participant AUTH as NextAuth v5
    participant DB as PostgreSQL

    Note over U,DB: Registro (primera vez)
    U->>LOGIN: /registro con nombre, email, password, rubro
    LOGIN->>AUTH: POST /api/registro
    AUTH->>DB: Crea Usuario (DUENIO) + Negocio + Categorias default
    AUTH-->>U: Redirect a /login

    Note over U,DB: Login
    U->>LOGIN: Email + password
    LOGIN->>AUTH: POST /api/auth/signin
    AUTH->>DB: Busca usuario, bcrypt.compare()
    AUTH->>AUTH: Genera JWT {id, email, rol, negocioId, rubroId}
    AUTH-->>U: Set cookie + redirect /dashboard

    Note over U,DB: Acceso protegido
    U->>AUTH: Request /dashboard/*
    AUTH->>AUTH: Middleware verifica JWT
    alt Sin token
        AUTH-->>U: Redirect /login
    else Con token
        AUTH-->>U: Acceso permitido
    end
```

---

## 8. API Routes (Endpoints)

| Endpoint | Metodo | Rol minimo | Descripcion |
|----------|--------|-----------|------------|
| `/api/auth/[...nextauth]` | GET/POST | Publico | NextAuth handlers |
| `/api/registro` | POST | Publico | Registro usuario + negocio |
| `/api/rubros` | GET | Publico | Listar rubros disponibles |
| `/api/dashboard/stats` | GET | Autenticado | KPIs: ventas hoy, productos, alertas stock |
| `/api/ventas` | GET/POST | Autenticado | Listar/crear ventas |
| `/api/ventas/[id]` | GET/DELETE | Autenticado | Detalle/cancelar venta |
| `/api/productos` | GET/POST | GET: todos, POST: DUENIO | CRUD productos |
| `/api/productos/[id]` | PUT/DELETE | DUENIO | Editar/eliminar producto |
| `/api/categorias` | GET/POST | GET: todos, POST: DUENIO | CRUD categorias |
| `/api/categorias/[id]` | PUT/DELETE | DUENIO | Editar/eliminar categoria |
| `/api/clientes` | GET/POST | Autenticado | CRUD clientes |
| `/api/clientes/[id]` | PUT/DELETE | Autenticado | Editar/eliminar cliente |
| `/api/proveedores` | GET/POST | DUENIO | CRUD proveedores |
| `/api/proveedores/[id]` | PUT/DELETE | DUENIO | Editar/eliminar proveedor |
| `/api/empleados` | GET/POST | DUENIO | CRUD empleados |
| `/api/empleados/[id]` | PUT/DELETE | DUENIO | Editar/eliminar empleado |
| `/api/caja` | GET/POST | Autenticado | Ver/abrir sesion de caja |
| `/api/caja/cerrar` | POST | Autenticado | Cerrar caja con reconciliacion |
| `/api/caja/movimientos` | GET/POST | Autenticado | Movimientos de caja |
| `/api/caja/historial` | GET | Autenticado | Historial de sesiones |
| `/api/reportes` | GET | DUENIO | Reportes de ventas |
| `/api/configuracion` | GET/PUT | DUENIO | Config del negocio |
| `/api/configuracion/perfil` | GET/PUT | Autenticado | Perfil del usuario |

---

## 9. Reglas de Negocio

### Precios y Stock
- **precioCompra**: Costo del producto (para calcular margen)
- **precioVenta**: Precio de venta al publico (Decimal 12,2 — sin errores de punto flotante)
- **Margen** = (precioVenta - precioCompra) / precioVenta
- **stock**: Cantidad actual disponible
- **stockMinimo**: Umbral para alerta (dashboard muestra warning cuando stock <= stockMinimo)
- **No se puede vender si stock < cantidad solicitada** (error 400)
- Stock se decrementa automaticamente al crear venta (transaccional)

### Ventas
- Numero auto-incremental por negocio (no global)
- Estados: COMPLETADA, CANCELADA, PENDIENTE
- Metodos de pago: EFECTIVO, DEBITO, CREDITO, TRANSFERENCIA, QR
- Descuento opcional (se resta del total, total nunca < 0)
- Cada venta queda ligada al vendedor y opcionalmente al cliente
- Cancelar una venta NO restaura stock (decision de negocio)

### Caja
- Una sola sesion abierta por negocio a la vez
- Al cerrar: esperado = montoInicial + ventasEfectivo + ingresos - egresos
- Se reporta diferencia (faltante/sobrante)
- Historial auditable

### Multi-tenancy
- Todo filtrado por `negocioId` — un negocio nunca ve datos de otro
- Soft deletes (`activo: false`) para auditoria — no se borran registros

### Roles
- **DUENIO**: Todo (productos, empleados, reportes, proveedores, config)
- **EMPLEADO**: Ventas, clientes, caja (operaciones del dia a dia)
- **ADMIN**: Reservado para administracion del sistema

### Rubros (Tipos de Negocio)
- Kiosco, Farmacia, Ferreteria, Ropa, Panaderia, Peluqueria
- Cada rubro tiene config JSON con labels personalizados:
  - Farmacia: "Productos" → "Medicamentos", "Ventas" → "Dispensas"
  - Peluqueria: "Productos" → "Servicios", "Ventas" → "Atenciones"
- Categorias default se crean automaticamente al registrar negocio

---

## 10. Variables de Entorno

| Variable | Uso | Requerida |
|----------|-----|-----------|
| `DATABASE_URL` | Conexion a Neon PostgreSQL | Si |
| `NEXTAUTH_SECRET` | Secret para firmar JWT | Si |
| `NEXTAUTH_URL` | URL base de la app | Si |

---

## 11. Diagrama: Como viaja la plata

```mermaid
graph TD
    subgraph "Entrada de dinero"
        VENTA_EF[Venta Efectivo]
        VENTA_DEB[Venta Debito]
        VENTA_CRED[Venta Credito]
        VENTA_TR[Venta Transferencia]
        VENTA_QR[Venta QR]
        ING[Ingreso Manual<br/>MovimientoCaja]
    end

    subgraph "Caja Registradora"
        SESION[CajaSesion<br/>montoInicial]
        SALDO[Saldo Esperado]
        CIERRE[Cierre<br/>montoFinal vs esperado]
    end

    subgraph "Salida de dinero"
        EGR[Egreso Manual<br/>MovimientoCaja]
    end

    subgraph "Registro contable"
        VENTA_DB[(Venta en DB<br/>total, metodoPago)]
        ITEM_DB[(ItemVenta<br/>qty × precio)]
        STOCK[(Producto.stock<br/>decrementado)]
    end

    VENTA_EF -->|suma a caja| SALDO
    VENTA_DEB & VENTA_CRED & VENTA_TR & VENTA_QR -->|no afecta caja fisica| VENTA_DB
    ING -->|suma| SALDO
    EGR -->|resta| SALDO
    SESION -->|base| SALDO
    SALDO -->|compara| CIERRE

    VENTA_EF & VENTA_DEB & VENTA_CRED & VENTA_TR & VENTA_QR --> VENTA_DB
    VENTA_DB --> ITEM_DB
    ITEM_DB -->|decrementa| STOCK
```

---

## 12. Metricas del Dashboard

| KPI | Calculo | Comparacion |
|-----|---------|-------------|
| Ventas del dia | SUM(total) WHERE fecha = hoy | vs ayer (% cambio) |
| Transacciones | COUNT(*) WHERE fecha = hoy | vs ayer |
| Productos activos | COUNT(*) WHERE activo = true | total |
| Alertas de stock | COUNT(*) WHERE stock <= stockMinimo | lista top 5 |

### Reportes disponibles
- Ventas por dia (ultimos 7+ dias, grafico de barras)
- Ventas por metodo de pago (pie chart)
- Top 5 productos mas vendidos
- Resumen: total facturado, cantidad de ventas, ticket promedio
