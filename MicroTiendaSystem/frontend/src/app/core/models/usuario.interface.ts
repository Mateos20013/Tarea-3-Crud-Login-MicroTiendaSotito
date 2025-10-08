export interface Usuario {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  email: string;
  rol: 'Admin' | 'Vendedor';
  fechaCreacion: Date;
  activo: boolean;
}

export interface LoginDto {
  nombreUsuario: string;
  password: string;
}

export interface RegisterDto {
  nombreUsuario: string;
  nombreCompleto: string;
  email: string;
  password: string;
  rol: 'Admin' | 'Vendedor';
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}
