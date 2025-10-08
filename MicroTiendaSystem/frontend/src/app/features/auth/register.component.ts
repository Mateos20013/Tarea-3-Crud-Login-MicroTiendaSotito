import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Crear Cuenta</mat-card-title>
          <mat-card-subtitle>Únete a MicroTienda</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre completo</mat-label>
              <input matInput formControlName="nombreCompleto" required>
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="registerForm.get('nombreCompleto')?.hasError('required')">
                El nombre completo es requerido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre de usuario</mat-label>
              <input matInput formControlName="nombreUsuario" required>
              <mat-icon matSuffix>account_circle</mat-icon>
              <mat-error *ngIf="registerForm.get('nombreUsuario')?.hasError('required')">
                El nombre de usuario es requerido
              </mat-error>
              <mat-error *ngIf="registerForm.get('nombreUsuario')?.hasError('minlength')">
                Mínimo 3 caracteres
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                El email es requerido
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Email no válido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                La contraseña es requerida
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Mínimo 6 caracteres
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar contraseña</mat-label>
              <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword" required>
              <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
                <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                Confirma tu contraseña
              </mat-error>
              <mat-error *ngIf="registerForm.hasError('mismatch')">
                Las contraseñas no coinciden
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Rol</mat-label>
              <mat-select formControlName="rol" required>
                <mat-option value="Vendedor">Vendedor</mat-option>
                <mat-option value="Admin">Administrador</mat-option>
              </mat-select>
              <mat-error *ngIf="registerForm.get('rol')?.hasError('required')">
                Selecciona un rol
              </mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="full-width register-button" [disabled]="registerForm.invalid || isLoading">
              {{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="text-center">¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia sesión aquí</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      width: 100%;
      max-width: 450px;
      padding: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .register-button {
      height: 48px;
      font-size: 16px;
      margin-top: 16px;
    }

    mat-card-title {
      text-align: center;
      color: #333;
      font-size: 24px;
      margin-bottom: 8px;
    }

    mat-card-subtitle {
      text-align: center;
      color: #666;
    }

    a {
      color: #3f51b5;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .text-center {
      text-align: center;
      margin: 16px 0 0 0;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      rol: ['Vendedor', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { mismatch: true };
    }
    return null;
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { confirmPassword, ...registerData } = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Cuenta creada exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || 'Error al crear la cuenta. Intenta nuevamente.';
          this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
}
