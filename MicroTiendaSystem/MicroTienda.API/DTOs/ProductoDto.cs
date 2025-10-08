using System.ComponentModel.DataAnnotations;

namespace MicroTienda.API.DTOs
{
    public class ProductoDto
    {
        public int ProductoId { get; set; }

        [Required]
        [StringLength(200)]
        public string Nombre { get; set; } = string.Empty;

        public string Descripcion { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Precio { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        public int StockMinimo { get; set; } = 5;

        public string Categoria { get; set; } = string.Empty;

        public string CodigoBarra { get; set; } = string.Empty;

        public string ImagenUrl { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;
    }

    public class CreateProductoDto
    {
        [Required]
        [StringLength(200)]
        public string Nombre { get; set; } = string.Empty;

        public string Descripcion { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Precio { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        public int StockMinimo { get; set; } = 5;

        public string Categoria { get; set; } = string.Empty;

        public string CodigoBarra { get; set; } = string.Empty;

        public string ImagenUrl { get; set; } = string.Empty;
    }
}
