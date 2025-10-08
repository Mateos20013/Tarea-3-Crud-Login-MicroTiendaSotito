using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MicroTienda.API.Data;
using MicroTienda.API.Models;
using MicroTienda.API.DTOs;
using MicroTienda.API.Services;

namespace MicroTienda.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly MicroTiendaContext _context;
        private readonly IJwtService _jwtService;

        public AuthController(MicroTiendaContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.NombreUsuario == loginDto.NombreUsuario && u.Activo);

            if (usuario == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, usuario.PasswordHash))
            {
                return Unauthorized(new { message = "Credenciales inválidas" });
            }

            var token = _jwtService.GenerateToken(usuario);
            var jwtSettings = HttpContext.RequestServices.GetRequiredService<IConfiguration>().GetSection("JwtSettings");
            var expiryInMinutes = int.Parse(jwtSettings["ExpiryInMinutes"]!);

            return Ok(new AuthResponseDto
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddMinutes(expiryInMinutes),
                Usuario = new UsuarioDto
                {
                    UsuarioId = usuario.UsuarioId,
                    NombreUsuario = usuario.NombreUsuario,
                    Email = usuario.Email,
                    NombreCompleto = usuario.NombreCompleto,
                    Rol = usuario.Rol,
                    Activo = usuario.Activo,
                    FechaCreacion = usuario.FechaCreacion,
                    FechaModificacion = usuario.FechaModificacion
                }
            });
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
        {
            if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == registerDto.NombreUsuario))
            {
                return BadRequest(new { message = "El nombre de usuario ya existe" });
            }

            if (await _context.Usuarios.AnyAsync(u => u.Email == registerDto.Email))
            {
                return BadRequest(new { message = "El email ya está registrado" });
            }

            var usuario = new Usuario
            {
                NombreUsuario = registerDto.NombreUsuario,
                Email = registerDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                NombreCompleto = registerDto.NombreCompleto,
                Rol = registerDto.Rol,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(usuario);
            var jwtSettings = HttpContext.RequestServices.GetRequiredService<IConfiguration>().GetSection("JwtSettings");
            var expiryInMinutes = int.Parse(jwtSettings["ExpiryInMinutes"]!);

            return Ok(new AuthResponseDto
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddMinutes(expiryInMinutes),
                Usuario = new UsuarioDto
                {
                    UsuarioId = usuario.UsuarioId,
                    NombreUsuario = usuario.NombreUsuario,
                    Email = usuario.Email,
                    NombreCompleto = usuario.NombreCompleto,
                    Rol = usuario.Rol,
                    Activo = usuario.Activo,
                    FechaCreacion = usuario.FechaCreacion,
                    FechaModificacion = usuario.FechaModificacion
                }
            });
        }

        [HttpPost("validate-token")]
        public IActionResult ValidateToken([FromBody] string token)
        {
            try
            {
                var principal = _jwtService.ValidateToken(token);
                return Ok(new { valid = true });
            }
            catch
            {
                return Ok(new { valid = false });
            }
        }
    }
}
