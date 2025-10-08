using System.ComponentModel.DataAnnotations;

namespace MicroTienda.API.DTOs
{
    public class VentaDto
    {
        public int VentaId { get; set; }
        public int UsuarioId { get; set; }
        public DateTime FechaVenta { get; set; }
        public decimal SubTotal { get; set; }
        public decimal Descuento { get; set; }
        public decimal Impuesto { get; set; }
        public decimal Total { get; set; }
        public string MetodoPago { get; set; } = string.Empty;
        public string Observaciones { get; set; } = string.Empty;
        public string EstadoVenta { get; set; } = string.Empty;
        public string NombreUsuario { get; set; } = string.Empty;
        public List<VentaDetalleDto> Detalles { get; set; } = new List<VentaDetalleDto>();
    }

    public class CreateVentaDto
    {
        [Required]
        public string MetodoPago { get; set; } = "Efectivo";
        
        public string Observaciones { get; set; } = string.Empty;
        
        public decimal Descuento { get; set; } = 0;
        
        public decimal Impuesto { get; set; } = 0;

        [Required]
        public List<CreateVentaDetalleDto> Detalles { get; set; } = new List<CreateVentaDetalleDto>();
    }

    public class VentaDetalleDto
    {
        public int VentaDetalleId { get; set; }
        public int ProductoId { get; set; }
        public string NombreProducto { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Descuento { get; set; }
        public decimal SubTotal { get; set; }
    }

    public class CreateVentaDetalleDto
    {
        [Required]
        public int ProductoId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Cantidad { get; set; }

        public decimal Descuento { get; set; } = 0;
    }
}
