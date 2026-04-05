# SalesSystem Frontend

Sistema frontend para gestión de ventas y eventos, desarrollado con Next.js.

## 🚀 Tecnologías

- **Next.js 14** - Framework React con App Router
- **React 18** - Librería de interfaz
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **shadcn/ui** - Componentes UI
- **React Hook Form** - Gestión de formularios
- **Zod** - Validación de esquemas
- **TanStack Query** - Gestión de estado servidor

## ⚡ Instalación

```bash
# Instalar dependencias
npm install
```

## 🔧 Configuración

El archivo `.env.local` ya está configurado:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Asegúrate de que el backend esté corriendo en `http://localhost:3001`.

## ▶️ Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run start
```

La aplicación estará disponible en: **http://localhost:3000**

## 📁 Estructura

```
frontend/
├── src/
│   ├── app/                    # Páginas (App Router)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Redirect
│   │   ├── globals.css         # Estilos globales
│   │   ├── login/              # Login
│   │   │   └── page.tsx
│   │   └── (dashboard)/        # Grupo de rutas privadas
│   │       ├── layout.tsx      # Layout con sidebar
│   │       ├── dashboard/      # Dashboard
│   │       ├── clients/        # Clientes
│   │       ├── products/       # Productos
│   │       ├── sales/          # Ventas
│   │       └── events/         # Eventos
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── badge.tsx
│   │   │   └── select.tsx
│   │   ├── providers.tsx       # TanStack Query provider
│   │   └── layout/             # Componentes de layout
│   ├── lib/
│   │   ├── api.ts              # Cliente axios con interceptors
│   │   └── utils.ts            # Utilidades (format, cn)
│   ├── types/
│   │   └── index.ts            # Interfaces TypeScript
│   └── hooks/                  # Hooks personalizados
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── .env.local
```

## 🎨 UI/UX

### Componentes shadcn/ui
- Button, Input, Label, Card
- Dialog (modal)
- Table (tablas)
- Textarea
- Badge (estados)
- Select (dropdowns)

### Funcionalidades
- 📊 **Dashboard**: Indicadores del mes, ventas por estado, eventos próximos
- 👥 **Clientes**: CRUD con búsqueda y filtros
- 📦 **Productos**: CRUD con filtros por categoría
- 🛒 **Ventas**: Formulario dinámico con items, cálculo automático
- 📅 **Eventos**: CRUD con gestión de documentos PDF
- 🔐 **Autenticación**: Login con JWT, cierre de sesión

## 📊 Rutas

| Ruta | Descripción |
|------|-------------|
| `/login` | Login de usuario |
| `/dashboard` | Panel principal |
| `/clients` | Gestión de clientes |
| `/products` | Catálogo de productos |
| `/sales` | Registro de ventas |
| `/events` | Gestión de eventos |

## 🔄 Flujo de Uso

1. **Login**: Ingresar credenciales (admin@salessystem.cl / admin123)
2. **Dashboard**: Ver indicadores y resumen
3. **Clientes**: Registrar nuevos clientes
4. **Productos**: Mantener catálogo
5. **Ventas**: Crear ventas con múltiples items
6. **Eventos**: Gestionar eventos y documentos

## 🔌 Integración con Backend

El cliente API (`src/lib/api.ts`) incluye:
- Base URL configurable por entorno
- Interceptor de requests (agrega JWT)
- Interceptor de responses (maneja 401)
- Tipado completo con TypeScript

## 🛠️ Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Producción
npm run lint    # Linting
npm run start   # Servidor producción
```

## 📝 Validaciones

Los formularios usan:
- **Zod** para esquemas de validación
- **React Hook Form** para gestión de estado
- Mensajes de error claros y en español

## 🎯 Características

- ✅ Diseño responsive
- ✅ Loading states
- ✅ Manejo de errores
- ✅ Confirmaciones para eliminar
- ✅ Estados vacíos
- ✅ Badges de estado con colores
- ✅ Paginación (backend)
- ✅ Búsqueda y filtros