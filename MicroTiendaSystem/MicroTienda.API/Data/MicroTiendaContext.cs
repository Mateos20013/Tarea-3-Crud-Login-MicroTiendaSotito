using Microsoft.EntityFrameworkCore;
using MicroTienda.API.Models;

namespace MicroTienda.API.Data
{
    public class MicroTiendaContext : DbContext
    {
        public MicroTiendaContext(DbContextOptions<MicroTiendaContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Venta> Ventas { get; set; }
        public DbSet<VentaDetalle> VentaDetalles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuraciones de Producto
            modelBuilder.Entity<Producto>(entity =>
            {
                entity.HasIndex(e => e.CodigoBarra).IsUnique();
                entity.Property(e => e.Precio).HasPrecision(18, 2);
            });

            // Configuraciones de Venta
            modelBuilder.Entity<Venta>(entity =>
            {
                entity.Property(e => e.SubTotal).HasPrecision(18, 2);
                entity.Property(e => e.Descuento).HasPrecision(18, 2);
                entity.Property(e => e.Impuesto).HasPrecision(18, 2);
                entity.Property(e => e.Total).HasPrecision(18, 2);

                entity.HasOne(d => d.Usuario)
                    .WithMany(p => p.Ventas)
                    .HasForeignKey(d => d.UsuarioId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuraciones de VentaDetalle
            modelBuilder.Entity<VentaDetalle>(entity =>
            {
                entity.Property(e => e.PrecioUnitario).HasPrecision(18, 2);
                entity.Property(e => e.Descuento).HasPrecision(18, 2);
                entity.Property(e => e.SubTotal).HasPrecision(18, 2);

                entity.HasOne(d => d.Venta)
                    .WithMany(p => p.VentaDetalles)
                    .HasForeignKey(d => d.VentaId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Producto)
                    .WithMany(p => p.VentaDetalles)
                    .HasForeignKey(d => d.ProductoId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Datos semilla
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Usuario administrador por defecto
            modelBuilder.Entity<Usuario>().HasData(
                new Usuario
                {
                    UsuarioId = 1,
                    NombreUsuario = "admin",
                    Email = "admin@microtienda.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    NombreCompleto = "Administrador del Sistema",
                    Rol = "Admin",
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                }
            );

            // Productos de ejemplo
            modelBuilder.Entity<Producto>().HasData(
                new Producto
                {
                    ProductoId = 1,
                    Nombre = "Coca Cola 600ml",
                    Descripcion = "Bebida gaseosa sabor cola",
                    Precio = 2.50m,
                    Stock = 50,
                    StockMinimo = 10,
                    Categoria = "Bebidas",
                    CodigoBarra = "7750182000161",
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                },
                new Producto
                {
                    ProductoId = 2,
                    Nombre = "Pan Integral",
                    Descripcion = "Pan integral de molde",
                    Precio = 3.20m,
                    Stock = 25,
                    StockMinimo = 5,
                    Categoria = "Panadería",
                    CodigoBarra = "7750182000162",
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                },
                new Producto
                {
                    ProductoId = 3,
                    Nombre = "Leche Gloria 1L",
                    Descripcion = "Leche evaporada entera",
                    Precio = 4.80m,
                    Stock = 30,
                    StockMinimo = 8,
                    Categoria = "Lácteos",
                    CodigoBarra = "7750182000163",
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                }
            );
        }
    }
}
