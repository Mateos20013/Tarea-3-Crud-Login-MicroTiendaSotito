export interface DashboardDto {
  ventasSemanales: VentasPeriodoDto;
  ventasMensuales: VentasPeriodoDto;
  ventasAnuales: VentasPeriodoDto;
  productosPopulares: ProductoPopularDto[];
}

export interface VentasPeriodoDto {
  totalVentas: number;
  totalProductosVendidos: number;
  totalOrdenes: number;
  promedioVentas: number;
  fechaInicio: Date;
  fechaFin: Date;
}

export interface ProductoPopularDto {
  id: number;
  nombre: string;
  categoria: string;
  cantidadVendida: number;
  totalVentas: number;
}
