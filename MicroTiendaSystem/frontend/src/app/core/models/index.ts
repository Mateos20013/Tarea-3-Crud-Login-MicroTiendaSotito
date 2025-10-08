export interface Usuario {
  usuarioId: number;
  nombreUsuario: string;
  email: string;
  nombreCompleto: string;
  rol: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaModificacion?: Date;
}

export interface LoginRequest {
  nombreUsuario: string;
  password: string;
}

export interface RegisterRequest {
  nombreUsuario: string;
  nombreCompleto: string;
  email: string;
  password: string;
  rol: 'Admin' | 'Vendedor';
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface Producto {
  productoId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  categoria: string;
  codigoBarra: string;
  imagenUrl: string;
  activo: boolean;
}

export interface CreateProducto {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  categoria: string;
  codigoBarra: string;
  imagenUrl: string;
}

export interface Venta {
  ventaId: number;
  usuarioId: number;
  fechaVenta: Date;
  subTotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  metodoPago: string;
  observaciones: string;
  estadoVenta: string;
  nombreUsuario: string;
  detalles: VentaDetalle[];
}

export interface VentaDetalle {
  ventaDetalleId: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subTotal: number;
}

export interface CreateVenta {
  metodoPago: string;
  observaciones: string;
  descuento: number;
  impuesto: number;
  detalles: CreateVentaDetalle[];
}

export interface CreateVentaDetalle {
  productoId: number;
  cantidad: number;
  descuento: number;
}

export interface Dashboard {
  estadisticasGenerales: EstadisticasGenerales;
  ventasSemanales: VentasPorPeriodo[];
  ventasMensuales: VentasPorPeriodo[];
  ventasAnuales: VentasPorPeriodo[];
  productosMasVendidos: ProductoMasVendido[];
  ventasPorMetodoPago: VentasPorMetodoPago[];
}

export interface EstadisticasGenerales {
  ventasHoy: number;
  ventasEsteMes: number;
  ventasEsteAno: number;
  totalProductos: number;
  productosBajoStock: number;
  ventasHoyCount: number;
  totalClientes: number;
  promedioVentaDiaria: number;
}

export interface VentasPorPeriodo {
  periodo: string;
  periodoNombre: string;
  fecha: Date;
  totalVentas: number;
  cantidadVentas: number;
  promedioVenta: number;
}

export interface ProductoMasVendido {
  productoId: number;
  nombreProducto: string;
  categoria: string;
  cantidadVendida: number;
  totalVentas: number;
}

export interface VentasPorMetodoPago {
  metodoPago: string;
  totalVentas: number;
  cantidadVentas: number;
  porcentaje: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
  errors?: string[];
}
