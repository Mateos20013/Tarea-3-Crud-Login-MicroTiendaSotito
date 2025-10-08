using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using MicroTienda.API.Data;
using MicroTienda.API.Models;
using MicroTienda.API.DTOs;

namespace MicroTienda.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProductosController : ControllerBase
    {
        private readonly MicroTiendaContext _context;

        public ProductosController(MicroTiendaContext context)
        {
            _context = context;
        }

        // GET: api/Productos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoDto>>> GetProductos(
            [FromQuery] string? buscar = null,
            [FromQuery] string? categoria = null,
            [FromQuery] bool? activo = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Productos.AsQueryable();

            if (!string.IsNullOrEmpty(buscar))
            {
                query = query.Where(p => p.Nombre.Contains(buscar) || 
                                        p.Descripcion.Contains(buscar) || 
                                        p.CodigoBarra.Contains(buscar));
            }

            if (!string.IsNullOrEmpty(categoria))
            {
                query = query.Where(p => p.Categoria == categoria);
            }

            if (activo.HasValue)
            {
                query = query.Where(p => p.Activo == activo.Value);
            }

            var totalItems = await query.CountAsync();
            var productos = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new ProductoDto
                {
                    ProductoId = p.ProductoId,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    Precio = p.Precio,
                    Stock = p.Stock,
                    StockMinimo = p.StockMinimo,
                    Categoria = p.Categoria,
                    CodigoBarra = p.CodigoBarra,
                    ImagenUrl = p.ImagenUrl,
                    Activo = p.Activo
                })
                .ToListAsync();

            Response.Headers.Append("X-Total-Count", totalItems.ToString());
            Response.Headers.Append("X-Page", page.ToString());
            Response.Headers.Append("X-Page-Size", pageSize.ToString());

            return Ok(productos);
        }

        // GET: api/Productos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoDto>> GetProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);

            if (producto == null)
            {
                return NotFound();
            }

            var productoDto = new ProductoDto
            {
                ProductoId = producto.ProductoId,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Stock = producto.Stock,
                StockMinimo = producto.StockMinimo,
                Categoria = producto.Categoria,
                CodigoBarra = producto.CodigoBarra,
                ImagenUrl = producto.ImagenUrl,
                Activo = producto.Activo
            };

            return Ok(productoDto);
        }

        // PUT: api/Productos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProducto(int id, CreateProductoDto productoDto)
        {
            var producto = await _context.Productos.FindAsync(id);
            
            if (producto == null)
            {
                return NotFound();
            }

            // Verificar código de barra único (excluyendo el producto actual)
            if (!string.IsNullOrEmpty(productoDto.CodigoBarra))
            {
                var existeCodigoBarra = await _context.Productos
                    .AnyAsync(p => p.CodigoBarra == productoDto.CodigoBarra && p.ProductoId != id);
                
                if (existeCodigoBarra)
                {
                    return BadRequest(new { message = "El código de barra ya existe" });
                }
            }

            producto.Nombre = productoDto.Nombre;
            producto.Descripcion = productoDto.Descripcion;
            producto.Precio = productoDto.Precio;
            producto.Stock = productoDto.Stock;
            producto.StockMinimo = productoDto.StockMinimo;
            producto.Categoria = productoDto.Categoria;
            producto.CodigoBarra = productoDto.CodigoBarra;
            producto.ImagenUrl = productoDto.ImagenUrl;
            producto.FechaModificacion = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductoExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // POST: api/Productos
        [HttpPost]
        public async Task<ActionResult<ProductoDto>> PostProducto(CreateProductoDto productoDto)
        {
            // Verificar código de barra único
            if (!string.IsNullOrEmpty(productoDto.CodigoBarra))
            {
                var existeCodigoBarra = await _context.Productos
                    .AnyAsync(p => p.CodigoBarra == productoDto.CodigoBarra);
                
                if (existeCodigoBarra)
                {
                    return BadRequest(new { message = "El código de barra ya existe" });
                }
            }

            var producto = new Producto
            {
                Nombre = productoDto.Nombre,
                Descripcion = productoDto.Descripcion,
                Precio = productoDto.Precio,
                Stock = productoDto.Stock,
                StockMinimo = productoDto.StockMinimo,
                Categoria = productoDto.Categoria,
                CodigoBarra = productoDto.CodigoBarra,
                ImagenUrl = productoDto.ImagenUrl,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            var resultado = new ProductoDto
            {
                ProductoId = producto.ProductoId,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Stock = producto.Stock,
                StockMinimo = producto.StockMinimo,
                Categoria = producto.Categoria,
                CodigoBarra = producto.CodigoBarra,
                ImagenUrl = producto.ImagenUrl,
                Activo = producto.Activo
            };

            return CreatedAtAction("GetProducto", new { id = producto.ProductoId }, resultado);
        }

        // DELETE: api/Productos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
            {
                return NotFound();
            }

            // Soft delete - solo marcar como inactivo
            producto.Activo = false;
            producto.FechaModificacion = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Productos/categorias
        [HttpGet("categorias")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategorias()
        {
            var categorias = await _context.Productos
                .Where(p => p.Activo && !string.IsNullOrEmpty(p.Categoria))
                .Select(p => p.Categoria)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(categorias);
        }

        // GET: api/Productos/stock-bajo
        [HttpGet("stock-bajo")]
        public async Task<ActionResult<IEnumerable<ProductoDto>>> GetProductosStockBajo()
        {
            var productos = await _context.Productos
                .Where(p => p.Activo && p.Stock <= p.StockMinimo)
                .Select(p => new ProductoDto
                {
                    ProductoId = p.ProductoId,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    Precio = p.Precio,
                    Stock = p.Stock,
                    StockMinimo = p.StockMinimo,
                    Categoria = p.Categoria,
                    CodigoBarra = p.CodigoBarra,
                    ImagenUrl = p.ImagenUrl,
                    Activo = p.Activo
                })
                .ToListAsync();

            return Ok(productos);
        }

        private bool ProductoExists(int id)
        {
            return _context.Productos.Any(e => e.ProductoId == id);
        }
    }
}
