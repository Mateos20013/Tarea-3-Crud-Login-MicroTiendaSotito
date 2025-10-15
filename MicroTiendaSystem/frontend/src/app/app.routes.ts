import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'productos',
    loadChildren: () => import('./features/productos').then(m => m.productosRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'ventas',
    loadChildren: () => import('./features/ventas').then(m => m.ventasRoutes),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
