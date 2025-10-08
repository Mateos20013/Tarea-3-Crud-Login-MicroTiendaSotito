# 🏪 MicroTienda Sistema de Gestión

## 📋 Descripción

**MicroTienda** es un sistema completo de gestión de ventas desarrollado con **Angular 20** en el frontend y **.NET 8** en el backend, diseñado para pequeñas tiendas que necesitan controlar su inventario, ventas y generar reportes.

## ✨ Características Principales

### 🔐 **Sistema de Autenticación**
- **Login/Register** con JWT
- **Roles de usuario**: Administrador y Vendedor
- **Gestión de sesiones** con localStorage
- **Guards de protección** para rutas

### 📊 **Dashboard Interactivo** 
- **Métricas en tiempo real**: ventas totales, productos vendidos, órdenes
- **Gráficos dinámicos** con Chart.js
- **Reportes por período**: semanal, mensual, anual
- **Productos más vendidos** y análisis de inventario

### 🛍️ **CRUD Completo de Productos**
- ✅ **Crear productos** con categorías, precios y stock
- ✅ **Listar productos** con filtros avanzados
- ✅ **Editar productos** existentes
- ✅ **Eliminar productos** con confirmación
- ✅ **Control de stock** y alertas de inventario bajo

### 💰 **Gestión de Ventas**
- ✅ **Registro de ventas** con múltiples productos
- ✅ **Cálculo automático** de subtotales, descuentos e impuestos
- ✅ **Métodos de pago** configurables
- ✅ **Historial completo** de todas las transacciones
- ✅ **Detalles de venta** con productos y cantidades

## 🛠️ Tecnologías Utilizadas

### 🎨 **Frontend (Angular 20)**
- **Angular 20** con SSR (Server-Side Rendering)
- **Angular Material** para componentes UI
- **Chart.js + ng2-charts** para gráficos
- **RxJS** para manejo reactivo de estado
- **TypeScript** para tipado fuerte
- **SCSS** para estilos avanzados

### 🔧 **Backend (.NET 8)**
- **.NET 8 Web API** con controladores RESTful
- **Entity Framework Core** para ORM
- **PostgreSQL** como base de datos
- **JWT Authentication** con BCrypt
- **AutoMapper** para mapeo de DTOs
- **Swagger** para documentación de API

### 🗄️ **Base de Datos**
- **PostgreSQL 13+** 
- **Migraciones automáticas** con EF Core
- **Seeding de datos** inicial (usuarios, productos de prueba)

## 🚀 Instalación y Configuración

### 📋 **Requisitos Previos**
- **Node.js 18+**
- **.NET 8 SDK**
- **PostgreSQL 13+**
- **Angular CLI 20+**

### ⚡ **Configuración Rápida**

#### 1. **Clonar el repositorio**
```bash
git clone https://github.com/Mateos20013/Tarea-3-Crud-Login-MicroTiendaSotito.git
cd Tarea-3-Crud-Login-MicroTiendaSotito
```

#### 2. **Configurar Backend**
```bash
# Navegar al backend
cd MicroTiendaSystem/MicroTienda.API

# Restaurar paquetes
dotnet restore

# Configurar cadena de conexión en appsettings.json
# Cambiar por tus credenciales de PostgreSQL:
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=MicroTiendaDB;Username=postgres;Password=TU_PASSWORD;Port=5432"
  }
}

# Ejecutar migraciones
dotnet ef database update

# Ejecutar el servidor
dotnet run
```
**Backend disponible en:** `http://localhost:5163`

#### 3. **Configurar Frontend**
```bash
# Navegar al frontend
cd ../frontend

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
ng serve
```
**Frontend disponible en:** `http://localhost:4200`

## 👤 Credenciales de Prueba

El sistema viene con usuarios pre-configurados:

### 👑 **Administrador**
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Permisos:** Acceso completo a todo el sistema

### 🛒 **Vendedor**
- **Usuario:** `vendedor`  
- **Contraseña:** `vendedor123`
- **Permisos:** Gestión de ventas y consulta de productos

## 📱 Funcionalidades por Rol

### 👑 **Administrador**
- ✅ **Dashboard completo** con todas las métricas
- ✅ **CRUD de productos** (crear, leer, actualizar, eliminar)
- ✅ **CRUD de ventas** (crear, leer, actualizar, eliminar)
- ✅ **Gestión de usuarios** (futuro)
- ✅ **Reportes avanzados** 
- ✅ **Configuración del sistema**

### 🛒 **Vendedor**
- ✅ **Dashboard básico** con métricas de ventas
- ✅ **Consultar productos** (solo lectura)
- ✅ **Registrar ventas** nuevas
- ✅ **Historial de ventas** propias
- ❌ No puede modificar productos
- ❌ No puede eliminar ventas

## 🏗️ Arquitectura del Sistema

### 📁 **Estructura del Proyecto**
```
MicroTiendaSystem/
├── 🔧 MicroTienda.API/          # Backend .NET 8
│   ├── Controllers/              # Controladores REST API
│   ├── Models/                   # Entidades de base de datos
│   ├── DTOs/                     # Objetos de transferencia
│   ├── Services/                 # Lógica de negocio
│   └── Data/                     # Contexto EF Core
│
└── 🎨 frontend/                  # Frontend Angular 20
    ├── src/app/
    │   ├── core/                 # Servicios y modelos core
    │   ├── features/             # Módulos de funcionalidades
    │   ├── shared/               # Componentes reutilizables
    │   └── guards/               # Guards de autenticación
    └── public/                   # Archivos estáticos
```

### 🔄 **Flujo de Datos**
1. **Usuario** interactúa con **Angular Frontend**
2. **Frontend** envía peticiones HTTP al **Backend API**  
3. **Backend** procesa con **Entity Framework Core**
4. **PostgreSQL** almacena y recupera datos
5. **JWT Tokens** manejan autenticación y autorización

## 📊 API Endpoints

### 🔐 **Autenticación**
```http
POST /api/Auth/login       # Iniciar sesión
POST /api/Auth/register    # Registrar usuario
POST /api/Auth/logout      # Cerrar sesión
```

### 🛍️ **Productos**
```http
GET    /api/Productos             # Listar productos
GET    /api/Productos/{id}        # Obtener producto
POST   /api/Productos             # Crear producto
PUT    /api/Productos/{id}        # Actualizar producto
DELETE /api/Productos/{id}        # Eliminar producto
```

### 💰 **Ventas** 
```http
GET    /api/Ventas                # Listar ventas
GET    /api/Ventas/{id}           # Obtener venta
POST   /api/Ventas                # Crear venta
PUT    /api/Ventas/{id}           # Actualizar venta
DELETE /api/Ventas/{id}           # Eliminar venta
```

### 📈 **Dashboard**
```http
GET /api/Dashboard                # Obtener métricas del dashboard
```

## 🎯 **Próximas Mejoras**

### 🚀 **Funcionalidades Planeadas**
- [ ] **Sistema de reportes** en PDF/Excel
- [ ] **Notificaciones push** para stock bajo
- [ ] **Múltiples sucursales**
- [ ] **Integración con sistemas de pago**
- [ ] **App móvil** con Flutter
- [ ] **Modo offline** con sincronización

### 🔧 **Mejoras Técnicas**
- [ ] **Tests unitarios** completos
- [ ] **Docker containerization**
- [ ] **CI/CD pipeline** con GitHub Actions
- [ ] **Logging avanzado** con Serilog
- [ ] **Caché con Redis**
- [ ] **Rate limiting** para API

## 🐳 Deploy con Docker

### **Próximamente**
```bash
# Construcción de contenedores
docker-compose up -d

# Acceso a la aplicación
# Frontend: http://localhost:4200
# Backend API: http://localhost:5163
# PostgreSQL: localhost:5432
```

## 🤝 Contribución

1. **Fork** el proyecto
2. **Crear** una rama feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** los cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abrir** un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Mateo** - [@Mateos20013](https://github.com/Mateos20013)

## 📞 Soporte

¿Problemas con la instalación? ¿Encontraste un bug? ¡Abre un [issue](https://github.com/Mateos20013/Tarea-3-Crud-Login-MicroTiendaSotito/issues)!

---

### ⭐ Si te gusta el proyecto, ¡dale una estrella en GitHub!

**🚀 Happy Coding!**
