using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MicroTienda.API.Models
{
    public class Producto
    {
        [Key]
        public int ProductoId { get; set; }

        [Required]
        [StringLength(200)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(500)]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Precio { get; set; }

        [Required]
        public int Stock { get; set; }

        public int StockMinimo { get; set; } = 5;

        [StringLength(100)]
        public string Categoria { get; set; } = string.Empty;

        [StringLength(50)]
        public string CodigoBarra { get; set; } = string.Empty;

        [StringLength(255)]
        public string ImagenUrl { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaModificacion { get; set; }

        // Navegación
        public virtual ICollection<VentaDetalle> VentaDetalles { get; set; } = new List<VentaDetalle>();
    }
}
