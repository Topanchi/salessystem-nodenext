# SalesSystem Backend

Sistema backend para gestión de ventas y eventos, desarrollado con NestJS.

## 🚀 Tecnologías

- **NestJS** - Framework Node.js progresivo
- **PostgreSQL** - Base de datos relacional
- **Prisma** - ORM para acceso a datos
- **JWT** - Autenticación con tokens
- **Swagger/OpenAPI** - Documentación de API

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 14+

## ⚡ Instalación

```bash
# Instalar dependencias
npm install
```

### Configuración de Base de Datos

El sistema maneja dos conexiones: **desarrollo** y **producción**.

```bash
# Desarrollo - Copiar y configurar .env
cp .env.example .env
# Editar .env con tus credenciales de base de datos dev

# Generar cliente Prisma y migrate (desarrollo)
npm run prisma:generate:dev
npm run prisma:migrate:dev

# Poblar datos iniciales (desarrollo)
npm run prisma:seed:dev
```

## 🔧 Configuración

Crear archivo `.env` basado en `.env.example`:

```env
# Entorno (development | production)
NODE_ENV=development
PORT=3001

# Database - Separadas por ambiente
DATABASE_URL_DEV=postgresql://user:password@localhost:5432/salesystem_dev
DATABASE_URL_PROD=postgresql://user:password@localhost:5432/salesystem_prod

# JWT
JWT_SECRET="tu-secret-key-aqui"
JWT_EXPIRES_IN="1d"

# Storage
STORAGE_LOCAL_PATH=./uploads
STORAGE_MAX_FILE_SIZE=10485760
```

**Nota**: El sistema selecciona automáticamente la base de datos según `NODE_ENV`:
- `development` → usa `DATABASE_URL_DEV`
- `production` → usa `DATABASE_URL_PROD`

## ▶️ Ejecución

```bash
# Desarrollo (con watch) - usa DATABASE_URL_DEV
npm run start:dev

# Producción - usa DATABASE_URL_PROD
npm run build
npm run start:prod
```

**Scripts por ambiente:**
| Script | Descripción |
|--------|-------------|
| `prisma:generate:dev` | Generar cliente para dev |
| `prisma:generate:prod` | Generar cliente para prod |
| `prisma:migrate:dev` | Migrar base dev |
| `prisma:migrate:prod` | Migrar base prod (deploy) |
| `prisma:push:dev` | Sincronizar schema dev |
| `prisma:push:prod` | Sincronizar schema prod |
| `prisma:seed:dev` | Poblar datos dev |
| `prisma:seed:prod` | Poblar datos prod |

El servidor estará disponible en: **http://localhost:3001**

## 📚 Documentación API

Swagger disponible en: **http://localhost:3001/api/docs**

## 👤 Credenciales (Seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@salessystem.cl | admin123 |
| Seller | vendedor@salessystem.cl | admin123 |
| Operations | operaciones@salessystem.cl | admin123 |

## 📁 Estructura

```
backend/
├── src/
│   ├── main.ts                 # Entry point
│   ├── app.module.ts           # Módulo principal
│   ├── config/                 # Configuración
│   ├── common/                 # Componentes compartidos
│   │   ├── dto/                # DTOs globales
│   │   ├── enums/              # Enumeraciones
│   │   ├── filters/            # Filtros de excepciones
│   │   ├── guards/             # Guards (auth, roles)
│   │   ├── decorators/         # Decoradores
│   │   └── utils/              # Utilidades
│   ├── modules/                # Módulos funcionales
│   │   ├── auth/               # Autenticación JWT
│   │   ├── users/             # Gestión de usuarios
│   │   ├── clients/           # CRUD Clientes
│   │   ├── products/          # CRUD Productos
│   │   ├── sales/             # Gestión Ventas
│   │   ├── events/            # Gestión Eventos
│   │   ├── documents/         # Documentos PDF
│   │   ├── dashboard/         # Indicadores
│   │   └── audit/             # Auditoría
│   ├── prisma/                # PrismaService
│   └── storage/               # Abstracción storage
├── prisma/
│   ├── schema.prisma          # Schema de base de datos
│   └── seed.ts                # Datos iniciales
└── package.json
```

## 🔌 Endpoints Principales

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

## 🧪 Tests

```bash
npm test              # Ejecutar tests
npm run test:watch   # Modo watch
npm run test:cov    # Coverage
```

## 📝 Estados

### Ventas
- PENDING → CONFIRMED → IN_PREPARATION → DELIVERED → CANCELLED

### Eventos
- QUOTED → CONFIRMED → IN_PREPARATION → EXECUTED → INVOICED → CLOSED → CANCELLED

## 🔐 Roles

- **ADMIN**: Acceso completo
- **SELLER**: Crear/editar ventas y eventos
- **OPERATIONS**: Ver y actualizar estados/documentos