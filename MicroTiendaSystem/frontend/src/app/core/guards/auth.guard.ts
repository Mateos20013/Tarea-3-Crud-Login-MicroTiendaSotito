import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { take, tap, map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ AuthGuard - Verificando acceso para:', state.url);

  // Solución profesional: usar Observable para verificar estado
  return authService.isAuthenticated$.pipe(
    take(1),
    tap(isAuth => console.log('🔍 AuthGuard - Estado actual:', isAuth)),
    map(isAuth => {
      if (isAuth) {
        const user = authService.getCurrentUser();
        console.log('✅ AuthGuard - Acceso permitido para:', user?.nombreUsuario || 'usuario');
        return true;
      } else {
        console.log('❌ AuthGuard - No autenticado, redirigiendo...');
        router.navigate(['/auth/login']);
        return false;
      }
    })
  );
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const currentUser = authService.getCurrentUser();

  if (currentUser?.rol === 'Admin') {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
