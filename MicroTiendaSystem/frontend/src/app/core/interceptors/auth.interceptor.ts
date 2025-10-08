import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  console.log('🔍 AuthInterceptor - Petición interceptada:', req.url);
  console.log('🔍 AuthInterceptor - Token disponible:', !!token);

  if (token) {
    console.log('🔑 AuthInterceptor - Agregando token Bearer a:', req.url);
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  } else {
    console.log('⚠️ AuthInterceptor - Sin token para:', req.url);
  }

  return next(req);
};
