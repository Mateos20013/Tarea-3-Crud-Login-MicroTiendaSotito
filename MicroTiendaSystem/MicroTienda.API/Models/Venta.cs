using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MicroTienda.API.Models
{
    public class Venta
    {
        [Key]
        public int VentaId { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        [Required]
        public DateTime FechaVenta { get; set; } = DateTime.UtcNow;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Descuento { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Impuesto { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        [StringLength(50)]
        public string MetodoPago { get; set; } = "Efectivo"; // Efectivo, Tarjeta, Transferencia

        [StringLength(500)]
        public string Observaciones { get; set; } = string.Empty;

        [StringLength(50)]
        public string EstadoVenta { get; set; } = "Completada"; // Completada, Cancelada, Pendiente

        // Foreign Keys
        [ForeignKey("UsuarioId")]
        public virtual Usuario Usuario { get; set; } = null!;

        // Navegación
        public virtual ICollection<VentaDetalle> VentaDetalles { get; set; } = new List<VentaDetalle>();
    }
}
