# SalesSystem - Sistema de Gestión de Ventas y Eventos

Sistema web completo para registro de ventas y gestión de eventos para negocio de tortas y banquetería.

## 📋 Descripción

Sistema de gestión integral que permite:
- **Ventas al detalle**: Registrar ventas con múltiples ítems, calcular totales, gestionar estados
- **Gestión de eventos**: Registrar eventos, asociar ventas, cargar documentos (orden de compra, factura)
- **Gestión administrativa**: Clientes, productos, dashboard con indicadores

## 🛠️ Tecnologías

### Backend
- **NestJS** - Framework Node.js
- **PostgreSQL** - Base de datos
- **Prisma** - ORM
- **JWT** - Autenticación
- **Swagger** - Documentación API

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Tipado
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes
- **TanStack Query** - Estado servidor
- **React Hook Form + Zod** - Formularios

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
npm install

# Configuración de base de datos por ambiente
# El sistema usa DATABASE_URL_DEV para desarrollo y DATABASE_URL_PROD para producción

# Desarrollo
cp .env.example .env
# Editar .env con tus credenciales
npm run prisma:generate:dev
npm run prisma:migrate:dev
npm run prisma:seed:dev
npm run start:dev

# Producción
npm run build
npm run start:prod
```

**Puerto**: http://localhost:3001
**Swagger**: http://localhost:3001/api/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

**Puerto**: http://localhost:3000

## 👤 Credenciales

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@salessystem.cl | admin123 |
| Seller | vendedor@salessystem.cl | admin123 |
| Operations | operaciones@salessystem.cl | admin123 |

## 📁 Estructura del Proyecto

```
salessystem-nodenext/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/        # Módulos funcionales
│   │   │   ├── auth/      # Autenticación JWT
│   │   │   ├── users/     # Usuarios
│   │   │   ├── clients/   # Clientes
│   │   │   ├── products/  # Productos
│   │   │   ├── sales/     # Ventas
│   │   │   ├── events/    # Eventos
│   │   │   ├── documents/ # Documentos
│   │   │   ├── dashboard/ # Indicadores
│   │   │   └── audit/     # Auditoría
│   │   ├── common/        # Componentes compartidos
│   │   ├── prisma/        # PrismaService
│   │   └── storage/       # Abstracción storage
│   └── prisma/
│       ├── schema.prisma  # Modelo de datos
│       └── seed.ts        # Datos iniciales
│
├── frontend/              # Next.js App
│   └── src/
│       ├── app/          # Páginas
│       │   ├── login/   # Login
│       │   └── (dashboard)/ # Rutas privadas
│       │       ├── dashboard/
│       │       ├── clients/
│       │       ├── products/
│       │       ├── sales/
│       │       └── events/
│       ├── components/   # Componentes UI
│       ├── lib/         # API y utilidades
│       └── types/       # Tipos TypeScript
│
├── README.md             # Este archivo
├── resumen_sistema.txt  # Resumen detallado
├── backend/README.md    # README Backend
└── frontend/README.md   # README Frontend
```

## 📊 Endpoints API

### Autenticación
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Perfil actual

### Clientes
- `GET /api/v1/clients` - Listar (paginado)
- `POST /api/v1/clients` - Crear
- `GET /api/v1/clients/:id` - Ver
- `PATCH /api/v1/clients/:id` - Actualizar
- `DELETE /api/v1/clients/:id` - Eliminar (soft)

### Productos
- `GET /api/v1/products` - Listar
- `POST /api/v1/products` - Crear
- `GET /api/v1/products/:id` - Ver
- `PATCH /api/v1/products/:id` - Actualizar
- `DELETE /api/v1/products/:id` - Eliminar

### Ventas
- `GET /api/v1/sales` - Listar
- `POST /api/v1/sales` - Crear
- `GET /api/v1/sales/:id` - Ver
- `PATCH /api/v1/sales/:id` - Actualizar
- `PATCH /api/v1/sales/:id/status` - Cambiar estado
- `DELETE /api/v1/sales/:id` - Cancelar

### Eventos
- `GET /api/v1/events` - Listar
- `POST /api/v1/events` - Crear
- `GET /api/v1/events/:id` - Ver
- `PATCH /api/v1/events/:id` - Actualizar
- `PATCH /api/v1/events/:id/status` - Cambiar estado
- `DELETE /api/v1/events/:id` - Cancelar

### Documentos
- `POST /api/v1/events/:id/documents` - Subir
- `GET /api/v1/events/:id/documents` - Listar
- `GET /api/v1/events/:id/documents/:docId/download` - Descargar
- `DELETE /api/v1/events/:id/documents/:docId` - Eliminar

### Dashboard
- `GET /api/v1/dashboard/summary` - Resumen indicadores

## 📝 Estados

### Ventas
```
PENDING → CONFIRMED → IN_PREPARATION → DELIVERED
                                    ↓
                                CANCELLED
```

### Eventos
```
QUOTED → CONFIRMED → IN_PREPARATION → EXECUTED → INVOICED → CLOSED
                                                               ↓
                                                           CANCELLED
```

## 🔐 Roles

| Rol | Descripción |
|-----|-------------|
| ADMIN | Acceso completo al sistema |
| SELLER | Crear y editar ventas y eventos |
| OPERATIONS | Ver y actualizar estados y documentos |

## 🗂️ Modelo de Datos

- **roles**: Roles de usuario (ADMIN, SELLER, OPERATIONS)
- **users**: Usuarios del sistema
- **clients**: Clientes
- **products**: Productos y servicios (TORTA, BANQUETERIA_DULCE, BANQUETERIA_SALADA, OTRO)
- **sales**: Ventas
- **sale_items**: Ítems de venta
- **events**: Eventos
- **event_documents**: Documentos de eventos (orden de compra, factura)
- **audit_log**: Auditoría de cambios

## 🧪 Tests

```bash
cd backend
npm test
```

## 📄 Documentación

- [README Backend](./backend/README.md) - Detalles del backend
- [README Frontend](./frontend/README.md) - Detalles del frontend
- [Resumen Sistema](./resumen_sistema.txt) - Resumen completo

## ✅ Funcionalidades

- ✅ Autenticación JWT con roles
- ✅ CRUD completo de clientes y productos
- ✅ Registro de ventas con múltiples ítems
- ✅ Gestión de eventos con documentos
- ✅ Dashboard con indicadores del mes
- ✅ Validaciones con Zod
- ✅ Diseño responsive
- ✅ Manejo de errores
- ✅ Swagger/OpenAPI
- ✅ Tests unitarios