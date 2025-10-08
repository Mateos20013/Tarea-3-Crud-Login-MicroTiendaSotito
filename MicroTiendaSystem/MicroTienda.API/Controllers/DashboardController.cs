using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using MicroTienda.API.Data;
using MicroTienda.API.DTOs;

namespace MicroTienda.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly MicroTiendaContext _context;

        public DashboardController(MicroTiendaContext context)
        {
            _context = context;
        }

        // GET: api/Dashboard
        [HttpGet]
        public async Task<ActionResult<DashboardDto>> GetDashboard()
        {
            var dashboard = new DashboardDto
            {
                EstadisticasGenerales = await GetEstadisticasGeneralesData(),
                VentasSemanales = await GetVentasSemanalesData(),
                VentasMensuales = await GetVentasMensualesData(),
                VentasAnuales = await GetVentasAnualesData(),
                ProductosMasVendidos = await GetProductosMasVendidosData(30), // Últimos 30 días
                VentasPorMetodoPago = await GetVentasPorMetodoPagoData(30) // Últimos 30 días
            };

            return Ok(dashboard);
        }

        // GET: api/Dashboard/estadisticas-generales
        [HttpGet("estadisticas-generales")]
        public async Task<ActionResult<EstadisticasGeneralesDto>> GetEstadisticasGenerales()
        {
            var estadisticas = await GetEstadisticasGeneralesData();
            return Ok(estadisticas);
        }

        private async Task<EstadisticasGeneralesDto> GetEstadisticasGeneralesData()
        {
            var hoy = DateTime.Today;
            var manana = hoy.AddDays(1);
            var inicioMes = new DateTime(hoy.Year, hoy.Month, 1);
            var inicioAno = new DateTime(hoy.Year, 1, 1);

            var ventasHoy = await _context.Ventas
                .Where(v => v.FechaVenta >= hoy && v.FechaVenta < manana && v.EstadoVenta == "Completada")
                .SumAsync(v => v.Total);

            var ventasEsteMes = await _context.Ventas
                .Where(v => v.FechaVenta >= inicioMes && v.EstadoVenta == "Completada")
                .SumAsync(v => v.Total);

            var ventasEsteAno = await _context.Ventas
                .Where(v => v.FechaVenta >= inicioAno && v.EstadoVenta == "Completada")
                .SumAsync(v => v.Total);

            var totalProductos = await _context.Productos
                .Where(p => p.Activo)
                .CountAsync();

            var productosBajoStock = await _context.Productos
                .Where(p => p.Activo && p.Stock <= p.StockMinimo)
                .CountAsync();

            var ventasHoyCount = await _context.Ventas
                .Where(v => v.FechaVenta >= hoy && v.FechaVenta < manana && v.EstadoVenta == "Completada")
                .CountAsync();

            var totalClientes = await _context.Usuarios
                .Where(u => u.Activo)
                .CountAsync();

            // Promedio de ventas diarias (últimos 30 días)
            var hace30Dias = hoy.AddDays(-30);
            var promedioVentaDiaria = await _context.Ventas
                .Where(v => v.FechaVenta >= hace30Dias && v.EstadoVenta == "Completada")
                .GroupBy(v => v.FechaVenta.Date)
                .Select(g => g.Sum(v => v.Total))
                .AverageAsync();

            var estadisticas = new EstadisticasGeneralesDto
            {
                VentasHoy = ventasHoy,
                VentasEsteMes = ventasEsteMes,
                VentasEsteAno = ventasEsteAno,
                TotalProductos = totalProductos,
                ProductosBajoStock = productosBajoStock,
                VentasHoyCount = ventasHoyCount,
                TotalClientes = totalClientes,
                PromedioVentaDiaria = promedioVentaDiaria
            };

            return estadisticas;
        }

        // GET: api/Dashboard/ventas-semanales
        [HttpGet("ventas-semanales")]
        public async Task<ActionResult<List<VentasPorPeriodoDto>>> GetVentasSemanales(int semanas = 12)
        {
            var ventas = await GetVentasSemanalesData(semanas);
            return Ok(ventas);
        }

        private async Task<List<VentasPorPeriodoDto>> GetVentasSemanalesData(int semanas = 12)
        {
            var hoy = DateTime.Today;
            var fechaInicio = hoy.AddDays(-semanas * 7);

            var ventasPorSemana = await _context.Ventas
                .Where(v => v.FechaVenta >= fechaInicio && v.EstadoVenta == "Completada")
                .GroupBy(v => new { 
                    Año = v.FechaVenta.Year,
                    Semana = CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(v.FechaVenta, CalendarWeekRule.FirstDay, DayOfWeek.Monday)
                })
                .Select(g => new VentasPorPeriodoDto
                {
                    Periodo = $"{g.Key.Año}-W{g.Key.Semana:D2}",
                    PeriodoNombre = $"Semana {g.Key.Semana} del {g.Key.Año}",
                    Fecha = g.Min(v => v.FechaVenta),
                    TotalVentas = g.Sum(v => v.Total),
                    CantidadVentas = g.Count(),
                    PromedioVenta = g.Average(v => v.Total)
                })
                .OrderBy(x => x.Fecha)
                .ToListAsync();

            return ventasPorSemana;
        }

        // GET: api/Dashboard/ventas-mensuales
        [HttpGet("ventas-mensuales")]
        public async Task<ActionResult<List<VentasPorPeriodoDto>>> GetVentasMensuales(int meses = 12)
        {
            var ventas = await GetVentasMensualesData(meses);
            return Ok(ventas);
        }

        private async Task<List<VentasPorPeriodoDto>> GetVentasMensualesData(int meses = 12)
        {
            var hoy = DateTime.Today;
            var fechaInicio = hoy.AddMonths(-meses);

            var ventasPorMes = await _context.Ventas
                .Where(v => v.FechaVenta >= fechaInicio && v.EstadoVenta == "Completada")
                .GroupBy(v => new { v.FechaVenta.Year, v.FechaVenta.Month })
                .Select(g => new VentasPorPeriodoDto
                {
                    Periodo = $"{g.Key.Year}-{g.Key.Month:D2}",
                    PeriodoNombre = $"{CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(g.Key.Month)} {g.Key.Year}",
                    Fecha = new DateTime(g.Key.Year, g.Key.Month, 1),
                    TotalVentas = g.Sum(v => v.Total),
                    CantidadVentas = g.Count(),
                    PromedioVenta = g.Average(v => v.Total)
                })
                .OrderBy(x => x.Fecha)
                .ToListAsync();

            return ventasPorMes;
        }

        // GET: api/Dashboard/ventas-anuales
        [HttpGet("ventas-anuales")]
        public async Task<ActionResult<List<VentasPorPeriodoDto>>> GetVentasAnuales(int anos = 5)
        {
            var ventas = await GetVentasAnualesData(anos);
            return Ok(ventas);
        }

        private async Task<List<VentasPorPeriodoDto>> GetVentasAnualesData(int anos = 5)
        {
            var hoy = DateTime.Today;
            var fechaInicio = hoy.AddYears(-anos);

            var ventasPorAno = await _context.Ventas
                .Where(v => v.FechaVenta >= fechaInicio && v.EstadoVenta == "Completada")
                .GroupBy(v => v.FechaVenta.Year)
                .Select(g => new VentasPorPeriodoDto
                {
                    Periodo = g.Key.ToString(),
                    PeriodoNombre = g.Key.ToString(),
                    Fecha = new DateTime(g.Key, 1, 1),
                    TotalVentas = g.Sum(v => v.Total),
                    CantidadVentas = g.Count(),
                    PromedioVenta = g.Average(v => v.Total)
                })
                .OrderBy(x => x.Fecha)
                .ToListAsync();

            return ventasPorAno;
        }

        // GET: api/Dashboard/productos-mas-vendidos
        [HttpGet("productos-mas-vendidos")]
        public async Task<ActionResult<List<ProductoMasVendidoDto>>> GetProductosMasVendidos(int dias = 30, int top = 10)
        {
            var productos = await GetProductosMasVendidosData(dias, top);
            return Ok(productos);
        }

        private async Task<List<ProductoMasVendidoDto>> GetProductosMasVendidosData(int dias = 30, int top = 10)
        {
            var fechaInicio = DateTime.Today.AddDays(-dias);

            var productosMasVendidos = await _context.VentaDetalles
                .Include(vd => vd.Producto)
                .Include(vd => vd.Venta)
                .Where(vd => vd.Venta.FechaVenta >= fechaInicio && vd.Venta.EstadoVenta == "Completada")
                .GroupBy(vd => new { 
                    vd.ProductoId, 
                    vd.Producto.Nombre, 
                    vd.Producto.Categoria 
                })
                .Select(g => new ProductoMasVendidoDto
                {
                    ProductoId = g.Key.ProductoId,
                    NombreProducto = g.Key.Nombre,
                    Categoria = g.Key.Categoria,
                    CantidadVendida = g.Sum(vd => vd.Cantidad),
                    TotalVentas = g.Sum(vd => vd.SubTotal)
                })
                .OrderByDescending(p => p.CantidadVendida)
                .Take(top)
                .ToListAsync();

            return productosMasVendidos;
        }

        // GET: api/Dashboard/ventas-por-metodo-pago
        [HttpGet("ventas-por-metodo-pago")]
        public async Task<ActionResult<List<VentasPorMetodoPagoDto>>> GetVentasPorMetodoPago(int dias = 30)
        {
            var ventas = await GetVentasPorMetodoPagoData(dias);
            return Ok(ventas);
        }

        private async Task<List<VentasPorMetodoPagoDto>> GetVentasPorMetodoPagoData(int dias = 30)
        {
            var fechaInicio = DateTime.Today.AddDays(-dias);

            var ventasPorMetodo = await _context.Ventas
                .Where(v => v.FechaVenta >= fechaInicio && v.EstadoVenta == "Completada")
                .GroupBy(v => v.MetodoPago)
                .Select(g => new VentasPorMetodoPagoDto
                {
                    MetodoPago = g.Key,
                    TotalVentas = g.Sum(v => v.Total),
                    CantidadVentas = g.Count()
                })
                .ToListAsync();

            var totalVentas = ventasPorMetodo.Sum(v => v.TotalVentas);

            foreach (var metodo in ventasPorMetodo)
            {
                metodo.Porcentaje = totalVentas > 0 ? (metodo.TotalVentas / totalVentas) * 100 : 0;
            }

            return ventasPorMetodo.OrderByDescending(v => v.TotalVentas).ToList();
        }

        // GET: api/Dashboard/reporte-personalizado
        [HttpGet("reporte-personalizado")]
        public async Task<ActionResult<ReporteVentasDto>> GetReportePersonalizado([FromQuery] FiltroReporteDto filtro)
        {
            var query = _context.Ventas
                .Include(v => v.Usuario)
                .Include(v => v.VentaDetalles)
                .ThenInclude(vd => vd.Producto)
                .Where(v => v.EstadoVenta == "Completada")
                .AsQueryable();

            if (filtro.FechaInicio.HasValue)
            {
                query = query.Where(v => v.FechaVenta >= filtro.FechaInicio.Value);
            }

            if (filtro.FechaFin.HasValue)
            {
                query = query.Where(v => v.FechaVenta <= filtro.FechaFin.Value.AddDays(1));
            }

            if (!string.IsNullOrEmpty(filtro.MetodoPago))
            {
                query = query.Where(v => v.MetodoPago == filtro.MetodoPago);
            }

            if (filtro.UsuarioId.HasValue)
            {
                query = query.Where(v => v.UsuarioId == filtro.UsuarioId.Value);
            }

            var ventas = await query.OrderByDescending(v => v.FechaVenta).ToListAsync();

            var totalVentas = ventas.Sum(v => v.Total);
            var cantidadVentas = ventas.Count;
            var promedioVenta = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0;

            // Productos más vendidos en el periodo
            var productosQuery = _context.VentaDetalles
                .Include(vd => vd.Producto)
                .Include(vd => vd.Venta)
                .Where(vd => vd.Venta.EstadoVenta == "Completada")
                .AsQueryable();

            if (filtro.FechaInicio.HasValue)
            {
                productosQuery = productosQuery.Where(vd => vd.Venta.FechaVenta >= filtro.FechaInicio.Value);
            }

            if (filtro.FechaFin.HasValue)
            {
                productosQuery = productosQuery.Where(vd => vd.Venta.FechaVenta <= filtro.FechaFin.Value.AddDays(1));
            }

            if (!string.IsNullOrEmpty(filtro.Categoria))
            {
                productosQuery = productosQuery.Where(vd => vd.Producto.Categoria == filtro.Categoria);
            }

            var productosMasVendidos = await productosQuery
                .GroupBy(vd => new { 
                    vd.ProductoId, 
                    vd.Producto.Nombre, 
                    vd.Producto.Categoria 
                })
                .Select(g => new ProductoMasVendidoDto
                {
                    ProductoId = g.Key.ProductoId,
                    NombreProducto = g.Key.Nombre,
                    Categoria = g.Key.Categoria,
                    CantidadVendida = g.Sum(vd => vd.Cantidad),
                    TotalVentas = g.Sum(vd => vd.SubTotal)
                })
                .OrderByDescending(p => p.CantidadVendida)
                .Take(10)
                .ToListAsync();

            var reporte = new ReporteVentasDto
            {
                FechaInicio = filtro.FechaInicio ?? DateTime.MinValue,
                FechaFin = filtro.FechaFin ?? DateTime.MaxValue,
                TotalVentas = totalVentas,
                CantidadVentas = cantidadVentas,
                PromedioVenta = promedioVenta,
                Ventas = ventas.Select(v => new VentaDto
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
                }).ToList(),
                ProductosMasVendidos = productosMasVendidos
            };

            return Ok(reporte);
        }

        // GET: api/Dashboard/ventas-tiempo-real
        [HttpGet("ventas-tiempo-real")]
        public async Task<ActionResult<object>> GetVentasTiempoReal()
        {
            var hoy = DateTime.Today;
            var ahora = DateTime.Now;

            // Ventas por horas del día actual
            var ventasPorHora = await _context.Ventas
                .Where(v => v.FechaVenta >= hoy && v.FechaVenta < hoy.AddDays(1) && v.EstadoVenta == "Completada")
                .GroupBy(v => v.FechaVenta.Hour)
                .Select(g => new {
                    Hora = g.Key,
                    TotalVentas = g.Sum(v => v.Total),
                    CantidadVentas = g.Count()
                })
                .OrderBy(x => x.Hora)
                .ToListAsync();

            // Última venta
            var ultimaVenta = await _context.Ventas
                .Include(v => v.Usuario)
                .Where(v => v.EstadoVenta == "Completada")
                .OrderByDescending(v => v.FechaVenta)
                .Select(v => new {
                    v.VentaId,
                    v.FechaVenta,
                    v.Total,
                    v.MetodoPago,
                    NombreUsuario = v.Usuario.NombreCompleto
                })
                .FirstOrDefaultAsync();

            return Ok(new {
                VentasPorHora = ventasPorHora,
                UltimaVenta = ultimaVenta,
                FechaActualizacion = ahora
            });
        }
    }
}
