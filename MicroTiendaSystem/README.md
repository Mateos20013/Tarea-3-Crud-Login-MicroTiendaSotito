# 🛒 MicroTienda - Sistema de Gestión de Ventas

Sistema completo de punto de venta desarrollado con arquitectura cliente-servidor, que permite la gestión eficiente de productos, ventas e inventario para pequeños negocios.

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Características Principales](#-características-principales)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Ejecución del Proyecto](#-ejecución-del-proyecto)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Usuarios de Prueba](#-usuarios-de-prueba)
- [Configuración de Base de Datos](#-configuración-de-base-de-datos)

---

## 🎯 Descripción General

**MicroTienda** es un sistema de punto de venta diseñado para facilitar la gestión de inventario y ventas en pequeños comercios. Cuenta con un sistema de autenticación basado en JWT, roles de usuario (Administrador y Vendedor), y un dashboard interactivo para visualizar métricas de negocio en tiempo real.

### Funcionalidades Clave

- ✅ **Autenticación segura** con JWT y roles de usuario
- 📦 **Gestión de productos** (CRUD completo)
- 💰 **Registro de ventas** con cálculo automático de impuestos y descuentos
- 📊 **Dashboard** con estadísticas y gráficos
- 🔍 **Búsqueda y filtrado** de productos
- 🧾 **Generación de tickets** de venta
- 💵 **Manejo de múltiples métodos de pago**

---

## 🏗️ Arquitectura del Sistema

El sistema sigue una arquitectura de 3 capas:

```
┌─────────────────────────────────────────────┐
│          FRONTEND (Angular 20)              │
│  • Componentes standalone                  │
│  • Angular Material UI                     │
│  • Reactive Forms & Signals                │
└─────────────────┬───────────────────────────┘
                  │ HTTP/REST
                  │ JWT Token
┌─────────────────▼───────────────────────────┐
│         BACKEND (.NET 9.0 Web API)          │
│  • Controllers (MVC pattern)                │
│  • Services & DTOs                          │
│  • JWT Authentication                       │
│  • CORS enabled                             │
└─────────────────┬───────────────────────────┘
                  │ Entity Framework Core
                  │ Npgsql Provider
┌─────────────────▼───────────────────────────┐
│        BASE DE DATOS (PostgreSQL)           │
│  • Tablas: Usuarios, Productos,            │
│           Ventas, VentaDetalles             │
│  • Relaciones y constraints                │
└─────────────────────────────────────────────┘
```

### Patrones de Diseño Implementados

- **MVC (Model-View-Controller)**: Separación de lógica de negocio
- **Repository Pattern**: Abstracción de acceso a datos via EF Core
- **DTO Pattern**: Data Transfer Objects para comunicación API
- **Dependency Injection**: Inyección de servicios en constructores
- **Guards & Interceptors**: Control de acceso y manejo de tokens
- **Signals & Computed**: Reactividad moderna en Angular

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **.NET 9.0** - Framework principal
- **ASP.NET Core Web API** - API RESTful
- **Entity Framework Core 9.0.9** - ORM
- **PostgreSQL** - Base de datos relacional
- **Npgsql 9.0.4** - Provider de PostgreSQL
- **JWT Bearer Authentication** - Seguridad
- **BCrypt.Net** - Hash de contraseñas
- **Swashbuckle (Swagger)** - Documentación API

### Frontend
- **Angular 20.3.4** - Framework SPA
- **Angular Material** - Componentes UI
- **TypeScript** - Lenguaje tipado
- **RxJS** - Programación reactiva
- **Signals** - Estado reactivo
- **Standalone Components** - Arquitectura moderna

### DevOps & Tools
- **Git/GitHub** - Control de versiones
- **Visual Studio Code** - IDE
- **pgAdmin/DBeaver** - Gestión de base de datos

---

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- Login con usuario y contraseña
- Tokens JWT con expiración de 60 minutos
- SessionStorage (sesión se cierra al cerrar navegador)
- Roles: **Admin** y **Vendedor**
- Guards para protección de rutas

### 📦 Gestión de Productos
- Crear, editar, listar y eliminar productos (soft delete)
- Campos: Nombre, Código de barras, Categoría, Precio, Stock, Descripción
- Búsqueda y filtrado por categoría y estado
- Validación de stock disponible
- Paginación del lado del servidor

### 💸 Gestión de Ventas
- Creación de ventas con múltiples productos
- Cálculo automático de:
  - Subtotal por producto
  - Descuentos (por producto y general)
  - Impuesto (19% IVA)
  - Total de venta
- Métodos de pago: Efectivo, Tarjeta, Transferencia
- Actualización automática de stock
- Visualización de detalles de venta
- Generación de ticket imprimible

### 📊 Dashboard
- Total de ventas del día/mes
- Productos más vendidos
- Productos con stock bajo
- Gráficos interactivos
- Estadísticas en tiempo real

---

## 📌 Requisitos Previos

Asegúrate de tener instalado:

- **Node.js** v18+ y **npm** v9+ → [Descargar](https://nodejs.org/)
- **.NET SDK 9.0** → [Descargar](https://dotnet.microsoft.com/download)
- **PostgreSQL 14+** → [Descargar](https://www.postgresql.org/download/)
- **Git** → [Descargar](https://git-scm.com/)

### Verificación de versiones

```bash
node --version    # v18.x.x o superior
npm --version     # 9.x.x o superior
dotnet --version  # 9.0.x
psql --version    # 14.x o superior
```

---

## 🚀 Instalación y Configuración

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/Mateos20013/Tarea-3-Crud-Login-MicroTiendaSotito.git
cd MicroTiendaSystem
```

### 2️⃣ Configurar Base de Datos PostgreSQL

#### Opción A: Usando pgAdmin o DBeaver

1. Crea una base de datos llamada `MicroTiendaDB`
2. Usuario: `postgres`
3. Contraseña: tu contraseña de PostgreSQL
4. Puerto: `5432` (default)

#### Opción B: Usando psql

```bash
psql -U postgres
CREATE DATABASE "MicroTiendaDB";
\q
```

### 3️⃣ Configurar Backend

**Navega al proyecto de API:**
```bash
cd MicroTienda.API
```

**Edita `appsettings.json` con tu configuración:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=MicroTiendaDB;Username=postgres;Password=TU_CONTRASEÑA;Port=5432"
  },
  "JwtSettings": {
    "SecretKey": "TuClaveSecretaSuperSeguraDeAlMenos32Caracteres123!",
    "Issuer": "MicroTienda.API",
    "Audience": "MicroTienda.Client",
    "ExpiryInMinutes": 60
  }
}
```

**Restaurar dependencias:**
```bash
dotnet restore
```

**La aplicación creará automáticamente las tablas al ejecutarse por primera vez.**

### 4️⃣ Configurar Frontend

**Navega al proyecto frontend:**
```bash
cd ../frontend
```

**Instalar dependencias:**
```bash
npm install
```

---

## ▶️ Ejecución del Proyecto

### Método 1: Ejecutar Manualmente (Recomendado)

**Terminal 1 - Backend:**
```bash
cd MicroTienda.API
dotnet run
```
> El backend estará disponible en: **http://localhost:5163**  
> Swagger UI: **http://localhost:5163/swagger**

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
> El frontend estará disponible en: **http://localhost:4200**

### Método 2: Ejecutar con PowerShell (Ambos a la vez)

```powershell
# Desde la raíz del proyecto
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd MicroTienda.API; dotnet run"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"
```

### Método 3: Usando Visual Studio (Solo Backend)

1. Abre `MicroTiendaSystem.sln`
2. Presiona `F5` o click en "Run"
3. En otra terminal ejecuta el frontend con `npm start`

---

## 📁 Estructura del Proyecto

```
MicroTiendaSystem/
│
├── MicroTienda.API/              # 🔧 Backend .NET
│   ├── Controllers/              # Controladores REST
│   │   ├── AuthController.cs     # Login, Register
│   │   ├── ProductosController.cs
│   │   ├── VentasController.cs
│   │   └── DashboardController.cs
│   ├── Models/                   # Entidades de base de datos
│   │   ├── Usuario.cs
│   │   ├── Producto.cs
│   │   ├── Venta.cs
│   │   └── VentaDetalle.cs
│   ├── DTOs/                     # Data Transfer Objects
│   ├── Data/                     # DbContext
│   │   └── MicroTiendaContext.cs
│   ├── Services/                 # Lógica de negocio
│   │   └── JwtService.cs
│   ├── Program.cs                # Configuración principal
│   └── appsettings.json          # Configuración (DB, JWT)
│
├── frontend/                     # 🎨 Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/             # Servicios, guards, modelos
│   │   │   │   ├── guards/
│   │   │   │   │   └── auth.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── auth.interceptor.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── productos.service.ts
│   │   │   │   │   └── ventas.service.ts
│   │   │   │   └── models/       # Interfaces TypeScript
│   │   │   ├── features/         # Módulos de funcionalidad
│   │   │   │   ├── auth/         # Login, Register
│   │   │   │   ├── dashboard/    # Dashboard principal
│   │   │   │   ├── productos/    # CRUD productos
│   │   │   │   └── ventas/       # CRUD ventas
│   │   │   ├── shared/           # Componentes compartidos
│   │   │   │   └── components/
│   │   │   │       ├── navbar.component.ts
│   │   │   │       └── confirm-dialog.component.ts
│   │   │   ├── app.routes.ts     # Configuración de rutas
│   │   │   └── app.ts            # Componente raíz
│   │   └── index.html            # HTML principal
│   ├── angular.json              # Configuración Angular
│   └── package.json              # Dependencias npm
│
├── MicroTiendaSystem.sln         # Solución Visual Studio
└── README.md                     # Este archivo
```

---

## 🌐 API Endpoints

### 🔐 Autenticación (`/api/Auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/Auth/login` | Iniciar sesión | ❌ |
| POST | `/api/Auth/register` | Registrar usuario | ❌ |
| POST | `/api/Auth/validate-token` | Validar token JWT | ✅ |

### 📦 Productos (`/api/Productos`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/Productos` | Listar productos (con filtros) | ✅ |
| GET | `/api/Productos/{id}` | Obtener producto por ID | ✅ |
| POST | `/api/Productos` | Crear producto | ✅ |
| PUT | `/api/Productos/{id}` | Actualizar producto | ✅ |
| DELETE | `/api/Productos/{id}` | Eliminar producto (soft delete) | ✅ |

**Query Parameters para GET:**
- `buscar` (string): Búsqueda por nombre
- `categoria` (string): Filtrar por categoría
- `activo` (bool): Filtrar por estado
- `page` (int): Número de página
- `pageSize` (int): Registros por página

### 💰 Ventas (`/api/Ventas`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/Ventas` | Listar ventas | ✅ |
| GET | `/api/Ventas/{id}` | Obtener venta por ID | ✅ |
| POST | `/api/Ventas` | Crear venta | ✅ |
| PUT | `/api/Ventas/{id}/cancelar` | Cancelar venta (reversa stock) | ✅ |

### 📊 Dashboard (`/api/Dashboard`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/Dashboard/estadisticas` | Obtener estadísticas generales | ✅ |

---

## 👥 Usuarios de Prueba

El sistema crea automáticamente usuarios de prueba al iniciar:

### 👨‍💼 Administrador
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Permisos**: Acceso total al sistema

### 👨‍💻 Vendedor
- **Usuario**: `vendedor`
- **Contraseña**: `vendedor123`
- **Permisos**: Gestión de ventas y consulta de productos

---

## 🗄️ Configuración de Base de Datos

### Esquema de Tablas

**Usuarios**
```sql
- UsuarioId (PK, Identity)
- NombreUsuario (Unique)
- Email
- PasswordHash
- NombreCompleto
- Rol (Admin/Vendedor)
- Activo
- FechaCreacion
```

**Productos**
```sql
- ProductoId (PK, Identity)
- Nombre
- CodigoBarra (Unique)
- Categoria
- Precio (Decimal)
- Stock (Int)
- Descripcion
- Activo
- FechaCreacion
```

**Ventas**
```sql
- VentaId (PK, Identity)
- UsuarioId (FK)
- Fecha
- MetodoPago
- SubTotal
- Descuento
- Impuesto
- Total
- Observaciones
- Estado
```

**VentaDetalles**
```sql
- DetalleId (PK, Identity)
- VentaId (FK)
- ProductoId (FK)
- Cantidad
- PrecioUnitario
- Descuento
- SubTotal
```

### Productos Iniciales

El sistema crea 3 productos de ejemplo:
1. Coca Cola 600ml - $2.50 (50 unidades)
2. Pan Integral - $3.20 (25 unidades)
3. Leche Gloria 1L - $4.80 (30 unidades)

---

## 🔧 Solución de Problemas

### Error de conexión a PostgreSQL
```bash
# Verifica que PostgreSQL esté corriendo
sudo service postgresql status  # Linux
# O verifica en Servicios de Windows

# Verifica credenciales en appsettings.json
```

### Puerto 5163 o 4200 en uso
```bash
# Windows - Liberar puerto
netstat -ano | findstr :5163
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5163 | xargs kill -9
```

### Error de CORS
- Verifica que el backend permita `http://localhost:4200`
- Revisa `Program.cs` en la sección CORS

### Sesión no persiste
- La aplicación usa `sessionStorage` (se limpia al cerrar navegador)
- Esto es intencional para mayor seguridad

---

## 📝 Notas Importantes

- ⚠️ **Seguridad**: Cambia `JwtSettings.SecretKey` en producción
- 💾 **Sesiones**: Se usan sessionStorage (se cierran al cerrar navegador)
- 💵 **Moneda**: Configurada en USD con formato de 2 decimales
- 🔄 **CORS**: Configurado para desarrollo (localhost:4200)
- 📊 **Impuesto**: Fijo del 19% (IVA)

---

## 👨‍💻 Autor

**Mateo Sotito**  
Ingeniería en Sistemas - Séptimo Semestre  
Universidad [Tu Universidad]

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos.

---

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la sección de [Solución de Problemas](#-solución-de-problemas)
2. Verifica los logs en la consola del navegador y terminal
3. Asegúrate de tener todas las dependencias instaladas
4. Contacta al desarrollador

---

**¡Gracias por usar MicroTienda! 🎉**
