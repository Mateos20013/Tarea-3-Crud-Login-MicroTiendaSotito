using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MicroTienda.API.Models
{
    public class VentaDetalle
    {
        [Key]
        public int VentaDetalleId { get; set; }

        [Required]
        public int VentaId { get; set; }

        [Required]
        public int ProductoId { get; set; }

        [Required]
        public int Cantidad { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal PrecioUnitario { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Descuento { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        // Foreign Keys
        [ForeignKey("VentaId")]
        public virtual Venta Venta { get; set; } = null!;

        [ForeignKey("ProductoId")]
        public virtual Producto Producto { get; set; } = null!;
    }
}
