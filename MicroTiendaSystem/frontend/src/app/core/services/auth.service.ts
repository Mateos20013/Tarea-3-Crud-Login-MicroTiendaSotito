import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Usuario, AuthResponse, LoginRequest, RegisterRequest } from '../models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  private readonly API_URL = 'http://localhost:5163/api/Auth';
  private readonly TOKEN_KEY = 'microtienda_token';
  private readonly USER_KEY = 'microtienda_user';

  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.initializeCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    console.log('🔧 AuthService - Inicializando servicio de autenticación');
    this.cleanupCorruptedData();
  }

  private initializeCurrentUser(): Usuario | null {
    try {
      const user = this.getCurrentUser();
      console.log('👤 AuthService - Usuario inicial:', user ? user.nombreUsuario : 'No autenticado');
      return user;
    } catch (error) {
      console.error('❌ AuthService - Error inicializando usuario:', error);
      return null;
    }
  }

  private cleanupCorruptedData(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userData = localStorage.getItem(this.USER_KEY);
      
      // Limpiar datos inválidos
      if (token === 'null' || token === 'undefined') {
        localStorage.removeItem(this.TOKEN_KEY);
      }
      
      if (userData === 'null' || userData === 'undefined') {
        localStorage.removeItem(this.USER_KEY);
      }
      
    } catch (error) {
      console.error('Error limpiando datos:', error);
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 AuthService.login() - Iniciando login con:', { 
      nombreUsuario: credentials.nombreUsuario,
      url: `${this.API_URL}/login` 
    });
    
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('📨 AuthService.login() - Respuesta del servidor:', response);
          if (response.token) {
            console.log('🔑 AuthService.login() - Token recibido, guardando sesión...');
            this.setSession(response);
            console.log('✅ AuthService.login() - Sesión guardada exitosamente');
          } else {
            console.error('❌ AuthService.login() - No se recibió token en la respuesta');
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setSession(response);
          }
        })
      );
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): Usuario | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      if (!userData || userData === 'null' || userData === 'undefined') {
        return null;
      }
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // Limpiar datos corruptos
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  hasRole(roles: string[]): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser ? roles.includes(currentUser.rol) : false;
  }

  private setSession(authResponse: AuthResponse): void {
    console.log('💾 AuthService.setSession() - Guardando sesión para:', authResponse.usuario?.nombreUsuario);
    
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.TOKEN_KEY, authResponse.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.usuario));
        console.log('✅ AuthService.setSession() - Datos guardados en localStorage');
      } catch (error) {
        console.error('❌ AuthService.setSession() - Error guardando en localStorage:', error);
      }
    }
    
    // Actualizar subjects de forma inmediata y síncrona
    console.log('📡 AuthService.setSession() - Actualizando subjects...');
    this.currentUserSubject.next(authResponse.usuario);
    this.isAuthenticatedSubject.next(true);
    
    // Verificación inmediata
    setTimeout(() => {
      console.log('🔍 AuthService.setSession() - Verificación post-update:', {
        isAuthenticated: this.isAuthenticatedSubject.value,
        currentUser: this.currentUserSubject.value?.nombreUsuario,
        hasToken: !!this.getToken()
      });
    }, 0);
  }

  private hasValidToken(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    try {
      const token = this.getToken();
      const user = this.getCurrentUser();
      
      // Verificar que tanto token como usuario existan y sean válidos
      if (!token || token === 'null' || token === 'undefined') {
        return false;
      }
      
      if (!user) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  validateToken(): Observable<{valid: boolean}> {
    const token = this.getToken();
    return this.http.post<{valid: boolean}>(`${this.API_URL}/validate-token`, token);
  }
}
