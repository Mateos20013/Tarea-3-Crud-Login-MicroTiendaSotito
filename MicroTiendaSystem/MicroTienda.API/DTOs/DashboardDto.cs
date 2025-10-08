namespace MicroTienda.API.DTOs
{
    public class DashboardDto
    {
        public EstadisticasGeneralesDto EstadisticasGenerales { get; set; } = new();
        public List<VentasPorPeriodoDto> VentasSemanales { get; set; } = new();
        public List<VentasPorPeriodoDto> VentasMensuales { get; set; } = new();
        public List<VentasPorPeriodoDto> VentasAnuales { get; set; } = new();
        public List<ProductoMasVendidoDto> ProductosMasVendidos { get; set; } = new();
        public List<VentasPorMetodoPagoDto> VentasPorMetodoPago { get; set; } = new();
    }

    public class EstadisticasGeneralesDto
    {
        public decimal VentasHoy { get; set; }
        public decimal VentasEsteMes { get; set; }
        public decimal VentasEsteAno { get; set; }
        public int TotalProductos { get; set; }
        public int ProductosBajoStock { get; set; }
        public int VentasHoyCount { get; set; }
        public int TotalClientes { get; set; }
        public decimal PromedioVentaDiaria { get; set; }
    }

    public class VentasPorPeriodoDto
    {
        public string Periodo { get; set; } = string.Empty; // "2024-W42", "2024-10", "2024"
        public string PeriodoNombre { get; set; } = string.Empty; // "Semana 42", "Octubre 2024"
        public DateTime Fecha { get; set; }
        public decimal TotalVentas { get; set; }
        public int CantidadVentas { get; set; }
        public decimal PromedioVenta { get; set; }
    }

    public class ProductoMasVendidoDto
    {
        public int ProductoId { get; set; }
        public string NombreProducto { get; set; } = string.Empty;
        public int CantidadVendida { get; set; }
        public decimal TotalVentas { get; set; }
        public string Categoria { get; set; } = string.Empty;
    }

    public class VentasPorMetodoPagoDto
    {
        public string MetodoPago { get; set; } = string.Empty;
        public decimal TotalVentas { get; set; }
        public int CantidadVentas { get; set; }
        public decimal Porcentaje { get; set; }
    }

    public class ReporteVentasDto
    {
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public decimal TotalVentas { get; set; }
        public int CantidadVentas { get; set; }
        public decimal PromedioVenta { get; set; }
        public List<VentaDto> Ventas { get; set; } = new();
        public List<ProductoMasVendidoDto> ProductosMasVendidos { get; set; } = new();
    }

    public class FiltroReporteDto
    {
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public string? MetodoPago { get; set; }
        public string? Categoria { get; set; }
        public int? UsuarioId { get; set; }
    }
}
