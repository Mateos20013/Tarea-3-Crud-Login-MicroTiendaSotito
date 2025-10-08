import { Routes } from '@angular/router';

export const ventasRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ventas-list.component').then(m => m.VentasListComponent)
  },
  {
    path: 'nueva',
    loadComponent: () => import('./venta-form.component').then(m => m.VentaFormComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./venta-form.component').then(m => m.VentaFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./venta-detail.component').then(m => m.VentaDetailComponent)
  }
];
