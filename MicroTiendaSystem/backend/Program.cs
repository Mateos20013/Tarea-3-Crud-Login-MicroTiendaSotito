using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MicroTienda.API.Data;
using MicroTienda.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Entity Framework con PostgreSQL
builder.Services.AddDbContext<MicroTiendaContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
        };
    });

builder.Services.AddAuthorization();

// Servicios personalizados
builder.Services.AddScoped<IJwtService, JwtService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAngularApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Crear base de datos si no existe y sembrar datos iniciales
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MicroTiendaContext>();
    context.Database.EnsureCreated();
    
    // Sembrar datos iniciales
    if (!context.Usuarios.Any())
    {
        var adminUser = new MicroTienda.API.Models.Usuario
        {
            NombreUsuario = "admin",
            NombreCompleto = "Administrador del Sistema",
            Email = "admin@microtienda.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Rol = "Admin",
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        };
        
        var vendedorUser = new MicroTienda.API.Models.Usuario
        {
            NombreUsuario = "vendedor",
            NombreCompleto = "Usuario Vendedor",
            Email = "vendedor@microtienda.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("vendedor123"),
            Rol = "Vendedor",
            Activo = true,
            FechaCreacion = DateTime.UtcNow
        };

        context.Usuarios.AddRange(adminUser, vendedorUser);
        context.SaveChanges();
    }
}

app.Run();
