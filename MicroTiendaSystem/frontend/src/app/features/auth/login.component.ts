import { Component, OnDestroy, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, tap, switchMap, filter, take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="card-header">
          <h1 class="title">🏪 MicroTiendaSotito</h1>
          <p class="subtitle">Sistema de Gestión de Ventas</p>
        </div>
        
        <div class="card-content">
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="login-form">
            
            <!-- Campo Usuario -->
            <div class="input-group">
              <label class="input-label">👤 Usuario</label>
              <div class="input-wrapper">
                <input 
                  #usernameInput
                  type="text"
                  class="form-input"
                  formControlName="nombreUsuario"
                  placeholder="Ingresa tu usuario"
                  autocomplete="off"
                  spellcheck="false"
                  [value]="loginForm.get('nombreUsuario')?.value || ''"
                  (input)="onInputChange('nombreUsuario', $event)"
                  (focus)="onFocus('nombreUsuario')"
                  [class.error]="hasError('nombreUsuario')">
                <button 
                  type="button" 
                  class="clear-button"
                  (click)="clearField('nombreUsuario')"
                  *ngIf="loginForm.get('nombreUsuario')?.value">
                  ✕
                </button>
              </div>
              <div class="error-message" *ngIf="hasError('nombreUsuario')">
                El usuario es requerido
              </div>
            </div>

            <!-- Campo Contraseña -->
            <div class="input-group">
              <label class="input-label">🔒 Contraseña</label>
              <div class="input-wrapper">
                <input 
                  #passwordInput
                  [type]="hidePassword ? 'password' : 'text'"
                  class="form-input"
                  formControlName="password"
                  placeholder="Ingresa tu contraseña"
                  autocomplete="off"
                  spellcheck="false"
                  [value]="loginForm.get('password')?.value || ''"
                  (input)="onInputChange('password', $event)"
                  (focus)="onFocus('password')"
                  [class.error]="hasError('password')">
                <button 
                  type="button" 
                  class="toggle-password"
                  (click)="togglePassword()">
                  {{ hidePassword ? '👁️' : '🙈' }}
                </button>
                <button 
                  type="button" 
                  class="clear-button"
                  (click)="clearField('password')"
                  *ngIf="loginForm.get('password')?.value">
                  ✕
                </button>
              </div>
              <div class="error-message" *ngIf="hasError('password')">
                La contraseña es requerida
              </div>
            </div>

            <!-- Botón de Login -->
            <button 
              type="submit" 
              class="login-button"
              [disabled]="isLoading"
              [class.loading]="isLoading">
              <span *ngIf="!isLoading">🚀 INICIAR SESIÓN</span>
              <span *ngIf="isLoading">⏳ Iniciando...</span>
            </button>

            <!-- Credenciales de Prueba -->
            <div class="demo-section">
              <p class="demo-title">🎯 Credenciales de Prueba:</p>
              <div class="demo-buttons">
                <button 
                  type="button" 
                  class="demo-button admin" 
                  (click)="fillCredentials('admin', 'admin123')">
                  👑 Administrador
                </button>
                <button 
                  type="button" 
                  class="demo-button vendor" 
                  (click)="fillCredentials('vendedor', 'vendedor123')">
                  🛒 Vendedor
                </button>
              </div>
            </div>

          </form>
        </div>

        <div class="card-footer">
          <p>¿No tienes cuenta? <a routerLink="/auth/register" class="register-link">Regístrate aquí</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
    }

    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      animation: slideUp 0.6s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .card-header {
      background: linear-gradient(135deg, #3f51b5 0%, #9c27b0 100%);
      color: white;
      text-align: center;
      padding: 40px 30px 30px;
    }

    .title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .subtitle {
      font-size: 14px;
      margin: 0;
      opacity: 0.9;
    }

    .card-content {
      padding: 40px 30px;
    }

    .login-form {
      width: 100%;
    }

    .input-group {
      margin-bottom: 24px;
    }

    .input-label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .form-input {
      width: 100%;
      height: 50px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 0 50px 0 16px;
      font-size: 16px;
      background: #fafafa;
      transition: all 0.3s ease;
      outline: none;
      color: #333;
    }

    .form-input:focus {
      border-color: #3f51b5;
      background: white;
      box-shadow: 0 0 0 3px rgba(63, 81, 181, 0.1);
    }

    .form-input.error {
      border-color: #f44336;
      background: #fef5f5;
    }

    .form-input::placeholder {
      color: #999;
    }

    .clear-button, .toggle-password {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      color: #666;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .toggle-password {
      right: 45px;
    }

    .clear-button:hover, .toggle-password:hover {
      background: #f5f5f5;
      color: #333;
    }

    .error-message {
      color: #f44336;
      font-size: 12px;
      margin-top: 6px;
      margin-left: 4px;
    }

    .login-button {
      width: 100%;
      height: 54px;
      background: linear-gradient(135deg, #3f51b5 0%, #9c27b0 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 20px;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 6px 20px rgba(63, 81, 181, 0.3);
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(63, 81, 181, 0.4);
    }

    .login-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .login-button.loading {
      background: #666;
    }

    .demo-section {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      text-align: center;
    }

    .demo-title {
      font-size: 14px;
      font-weight: 600;
      color: #555;
      margin: 0 0 16px 0;
    }

    .demo-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .demo-button {
      flex: 1;
      min-width: 120px;
      padding: 10px 16px;
      border: 2px solid transparent;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      background: white;
    }

    .demo-button.admin {
      border-color: #ff9800;
      color: #ff9800;
    }

    .demo-button.admin:hover {
      background: #ff9800;
      color: white;
    }

    .demo-button.vendor {
      border-color: #4caf50;
      color: #4caf50;
    }

    .demo-button.vendor:hover {
      background: #4caf50;
      color: white;
    }

    .card-footer {
      background: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }

    .card-footer p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .register-link {
      color: #3f51b5;
      text-decoration: none;
      font-weight: 600;
    }

    .register-link:hover {
      text-decoration: underline;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .login-container {
        padding: 16px;
      }
      
      .card-content {
        padding: 30px 24px;
      }
      
      .card-header {
        padding: 30px 24px 24px;
      }
      
      .title {
        font-size: 24px;
      }
      
      .demo-buttons {
        flex-direction: column;
      }
    }

    /* Eliminar autocompletado visual */
    .form-input:-webkit-autofill,
    .form-input:-webkit-autofill:hover,
    .form-input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0px 1000px white inset !important;
      -webkit-text-fill-color: #333 !important;
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('usernameInput') usernameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;
  
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Crear formulario con validaciones más simples
    this.loginForm = this.fb.group({
      nombreUsuario: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Métodos de manejo del formulario
  private initializeForm(): void {
    // Limpiar formulario completamente
    this.loginForm.reset();
    this.loginForm.patchValue({ nombreUsuario: '', password: '' });
    
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.clearAllInputs(), 300);
    }
  }

  private clearAllInputs(): void {
    if (isPlatformBrowser(this.platformId)) {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        input.value = '';
        input.setAttribute('value', '');
      });
    }
  }

  onInputChange(fieldName: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const control = this.loginForm.get(fieldName);
    if (control) {
      control.setValue(input.value);
      control.markAsTouched();
    }
  }

  onFocus(fieldName: string): void {
    // Marcar como tocado al hacer focus
    const control = this.loginForm.get(fieldName);
    if (control) {
      control.markAsTouched();
    }
  }

  clearField(fieldName: string): void {
    const control = this.loginForm.get(fieldName);
    if (control) {
      control.setValue('');
      control.markAsUntouched();
    }
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  hasError(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  fillCredentials(username: string, password: string): void {
    console.log('🎯 Rellenando credenciales:', username);
    
    // Limpiar formulario y actualizar valores de forma directa
    this.loginForm.patchValue({
      nombreUsuario: username,
      password: password
    });
    
    // Marcar como tocado para activar validaciones
    this.loginForm.get('nombreUsuario')?.markAsTouched();
    this.loginForm.get('password')?.markAsTouched();
    
    console.log('✅ Credenciales aplicadas:', this.loginForm.value);
  }

  onLogin(): void {
    console.log('🚀 === INICIANDO PROCESO DE LOGIN ===');
    console.log('📊 Estado del formulario completo:', {
      value: this.loginForm.value,
      valid: this.loginForm.valid,
      touched: this.loginForm.touched,
      dirty: this.loginForm.dirty,
      errors: this.loginForm.errors
    });

    console.log('🔍 Detalles de cada control:');
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      console.log(`  ${key}:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors,
        touched: control?.touched
      });
    });
    
    if (this.isLoading) {
      console.log('⏳ Ya se está procesando un login, saliendo...');
      return;
    }

    // Obtener valores directamente
    const nombreUsuario = this.loginForm.get('nombreUsuario')?.value;
    const password = this.loginForm.get('password')?.value;

    console.log('📝 Valores RAW del formulario:', { 
      nombreUsuario: `"${nombreUsuario}"`, 
      password: `"${password}"`,
      nombreUsuarioType: typeof nombreUsuario,
      passwordType: typeof password,
      nombreUsuarioLength: nombreUsuario ? nombreUsuario.length : 'null',
      passwordLength: password ? password.length : 'null'
    });

    // Limpiar solo si no son null
    const nombreUsuarioClean = nombreUsuario ? nombreUsuario.toString().trim() : '';
    const passwordClean = password ? password.toString().trim() : '';

    console.log('🧹 Valores después de limpiar:', { 
      nombreUsuario: `"${nombreUsuarioClean}"`, 
      password: passwordClean ? `"${passwordClean.substring(0,3)}..."` : '""',
      nombreUsuarioLength: nombreUsuarioClean.length,
      passwordLength: passwordClean.length
    });

    // Validación más simple
    if (!nombreUsuarioClean) {
      console.log('❌ Error: nombreUsuario está vacío');
      this.snackBar.open('El campo usuario es requerido', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!passwordClean) {
      console.log('❌ Error: password está vacío');
      this.snackBar.open('El campo contraseña es requerido', 'Cerrar', { duration: 3000 });
      return;
    }

    console.log('✅ Validaciones pasadas, preparando petición...');
    this.isLoading = true;

    const loginData = { 
      nombreUsuario: nombreUsuarioClean, 
      password: passwordClean 
    };

    console.log('🌐 Enviando petición LOGIN a API:', {
      url: 'http://localhost:5163/api/Auth/login',
      data: { ...loginData, password: '***' }
    });

    this.authService.login(loginData)
      .pipe(
        takeUntil(this.destroy$),
        tap((response: any) => {
          console.log('🎉 LOGIN EXITOSO - Response:', response);
          this.snackBar.open(`¡Bienvenido ${response.usuario?.nombreUsuario}!`, 'Cerrar', { duration: 3000 });
        }),
        // Esperar a que la autenticación se establezca completamente
        switchMap(() => this.authService.isAuthenticated$.pipe(
          filter((isAuth: boolean) => isAuth === true),
          take(1),
          tap(() => console.log('✅ Estado de autenticación confirmado'))
        ))
      )
      .subscribe({
        next: () => {
          console.log('🏠 Navegando al dashboard con estado confirmado...');
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('💥 ERROR EN LOGIN:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: error.message,
            url: error.url
          });
          this.isLoading = false;
          
          let errorMessage = 'Error al iniciar sesión';
          if (error.status === 0) {
            errorMessage = '🔌 No hay conexión con el servidor (puerto 5163)';
            console.error('🔌 El servidor backend NO está ejecutándose o hay un problema de CORS');
          } else if (error.status === 401) {
            errorMessage = '🔒 Usuario o contraseña incorrectos';
          } else if (error.status === 500) {
            errorMessage = '⚠️ Error interno del servidor';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          console.log('📱 Mostrando mensaje de error:', errorMessage);
          this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
        }
      });
  }
}
