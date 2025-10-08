using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MicroTienda.API.Data;
using MicroTienda.API.Models;
using MicroTienda.API.DTOs;

namespace MicroTienda.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VentasController : ControllerBase
    {
        private readonly MicroTiendaContext _context;

        public VentasController(MicroTiendaContext context)
        {
            _context = context;
        }

        // GET: api/Ventas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VentaDto>>> GetVentas(
            [FromQuery] DateTime? fechaInicio = null,
            [FromQuery] DateTime? fechaFin = null,
            [FromQuery] string? metodoPago = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Ventas
                .Include(v => v.Usuario)
                .Include(v => v.VentaDetalles)
                .ThenInclude(vd => vd.Producto)
                .AsQueryable();

            if (fechaInicio.HasValue)
            {
                query = query.Where(v => v.FechaVenta >= fechaInicio.Value);
            }

            if (fechaFin.HasValue)
            {
                query = query.Where(v => v.FechaVenta <= fechaFin.Value.AddDays(1));
            }

            if (!string.IsNullOrEmpty(metodoPago))
            {
                query = query.Where(v => v.MetodoPago == metodoPago);
            }

            var totalItems = await query.CountAsync();
            var ventas = await query
                .OrderByDescending(v => v.FechaVenta)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(v => new VentaDto
                {
                    VentaId = v.VentaId,
                    UsuarioId = v.UsuarioId,
                    FechaVenta = v.FechaVenta,
                    SubTotal = v.SubTotal,
                    Descuento = v.Descuento,
                    Impuesto = v.Impuesto,
                    Total = v.Total,
                    MetodoPago = v.MetodoPago,
                    Observaciones = v.Observaciones,
                    EstadoVenta = v.EstadoVenta,
                    NombreUsuario = v.Usuario.NombreCompleto,
                    Detalles = v.VentaDetalles.Select(vd => new VentaDetalleDto
                    {
                        VentaDetalleId = vd.VentaDetalleId,
                        ProductoId = vd.ProductoId,
                        NombreProducto = vd.Producto.Nombre,
                        Cantidad = vd.Cantidad,
                        PrecioUnitario = vd.PrecioUnitario,
                        Descuento = vd.Descuento,
                        SubTotal = vd.SubTotal
                    }).ToList()
                })
                .ToListAsync();

            Response.Headers.Append("X-Total-Count", totalItems.ToString());
            Response.Headers.Append("X-Page", page.ToString());
            Response.Headers.Append("X-Page-Size", pageSize.ToString());

            return Ok(ventas);
        }

        // GET: api/Ventas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<VentaDto>> GetVenta(int id)
        {
            var venta = await _context.Ventas
                .Include(v => v.Usuario)
                .Include(v => v.VentaDetalles)
                .ThenInclude(vd => vd.Producto)
                .FirstOrDefaultAsync(v => v.VentaId == id);

            if (venta == null)
            {
                return NotFound();
            }

            var ventaDto = new VentaDto
            {
                VentaId = venta.VentaId,
                UsuarioId = venta.UsuarioId,
                FechaVenta = venta.FechaVenta,
                SubTotal = venta.SubTotal,
                Descuento = venta.Descuento,
                Impuesto = venta.Impuesto,
                Total = venta.Total,
                MetodoPago = venta.MetodoPago,
                Observaciones = venta.Observaciones,
                EstadoVenta = venta.EstadoVenta,
                NombreUsuario = venta.Usuario.NombreCompleto,
                Detalles = venta.VentaDetalles.Select(vd => new VentaDetalleDto
                {
                    VentaDetalleId = vd.VentaDetalleId,
                    ProductoId = vd.ProductoId,
                    NombreProducto = vd.Producto.Nombre,
                    Cantidad = vd.Cantidad,
                    PrecioUnitario = vd.PrecioUnitario,
                    Descuento = vd.Descuento,
                    SubTotal = vd.SubTotal
                }).ToList()
            };

            return Ok(ventaDto);
        }

        // POST: api/Ventas
        [HttpPost]
        public async Task<ActionResult<VentaDto>> PostVenta(CreateVentaDto ventaDto)
        {
            var usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            if (usuarioId == 0)
            {
                return Unauthorized();
            }

            // Validar que todos los productos existen y tienen stock suficiente
            var productosIds = ventaDto.Detalles.Select(d => d.ProductoId).ToList();
            var productos = await _context.Productos
                .Where(p => productosIds.Contains(p.ProductoId) && p.Activo)
                .ToListAsync();

            if (productos.Count != productosIds.Count)
            {
                return BadRequest(new { message = "Uno o más productos no existen o están inactivos" });
            }

            decimal subTotal = 0;

            // Validar stock y calcular subtotal
            var detallesVenta = new List<VentaDetalle>();
            foreach (var detalle in ventaDto.Detalles)
            {
                var producto = productos.First(p => p.ProductoId == detalle.ProductoId);
                
                if (producto.Stock < detalle.Cantidad)
                {
                    return BadRequest(new { 
                        message = $"Stock insuficiente para el producto {producto.Nombre}. Stock disponible: {producto.Stock}" 
                    });
                }

                var subtotalDetalle = (producto.Precio * detalle.Cantidad) - detalle.Descuento;
                subTotal += subtotalDetalle;

                detallesVenta.Add(new VentaDetalle
                {
                    ProductoId = detalle.ProductoId,
                    Cantidad = detalle.Cantidad,
                    PrecioUnitario = producto.Precio,
                    Descuento = detalle.Descuento,
                    SubTotal = subtotalDetalle
                });
            }

            var total = subTotal - ventaDto.Descuento + ventaDto.Impuesto;

            var venta = new Venta
            {
                UsuarioId = usuarioId,
                FechaVenta = DateTime.UtcNow,
                SubTotal = subTotal,
                Descuento = ventaDto.Descuento,
                Impuesto = ventaDto.Impuesto,
                Total = total,
                MetodoPago = ventaDto.MetodoPago,
                Observaciones = ventaDto.Observaciones,
                EstadoVenta = "Completada",
                VentaDetalles = detallesVenta
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                _context.Ventas.Add(venta);
                await _context.SaveChangesAsync();

                // Actualizar stock de productos
                foreach (var detalle in ventaDto.Detalles)
                {
                    var producto = productos.First(p => p.ProductoId == detalle.ProductoId);
                    producto.Stock -= detalle.Cantidad;
                    producto.FechaModificacion = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Obtener la venta creada con todas las relaciones
                var ventaCreada = await _context.Ventas
                    .Include(v => v.Usuario)
                    .Include(v => v.VentaDetalles)
                    .ThenInclude(vd => vd.Producto)
                    .FirstAsync(v => v.VentaId == venta.VentaId);

                var resultado = new VentaDto
                {
                    VentaId = ventaCreada.VentaId,
                    UsuarioId = ventaCreada.UsuarioId,
                    FechaVenta = ventaCreada.FechaVenta,
                    SubTotal = ventaCreada.SubTotal,
                    Descuento = ventaCreada.Descuento,
                    Impuesto = ventaCreada.Impuesto,
                    Total = ventaCreada.Total,
                    MetodoPago = ventaCreada.MetodoPago,
                    Observaciones = ventaCreada.Observaciones,
                    EstadoVenta = ventaCreada.EstadoVenta,
                    NombreUsuario = ventaCreada.Usuario.NombreCompleto,
                    Detalles = ventaCreada.VentaDetalles.Select(vd => new VentaDetalleDto
                    {
                        VentaDetalleId = vd.VentaDetalleId,
                        ProductoId = vd.ProductoId,
                        NombreProducto = vd.Producto.Nombre,
                        Cantidad = vd.Cantidad,
                        PrecioUnitario = vd.PrecioUnitario,
                        Descuento = vd.Descuento,
                        SubTotal = vd.SubTotal
                    }).ToList()
                };

                return CreatedAtAction("GetVenta", new { id = venta.VentaId }, resultado);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // PUT: api/Ventas/5/cancelar
        [HttpPut("{id}/cancelar")]
        public async Task<IActionResult> CancelarVenta(int id)
        {
            var venta = await _context.Ventas
                .Include(v => v.VentaDetalles)
                .ThenInclude(vd => vd.Producto)
                .FirstOrDefaultAsync(v => v.VentaId == id);

            if (venta == null)
            {
                return NotFound();
            }

            if (venta.EstadoVenta == "Cancelada")
            {
                return BadRequest(new { message = "La venta ya está cancelada" });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Devolver stock a los productos
                foreach (var detalle in venta.VentaDetalles)
                {
                    detalle.Producto.Stock += detalle.Cantidad;
                    detalle.Producto.FechaModificacion = DateTime.UtcNow;
                }

                venta.EstadoVenta = "Cancelada";
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return NoContent();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // GET: api/Ventas/metodos-pago
        [HttpGet("metodos-pago")]
        public IActionResult GetMetodosPago()
        {
            var metodosPago = new[] { "Efectivo", "Tarjeta", "Transferencia" };
            return Ok(metodosPago);
        }
    }
}
