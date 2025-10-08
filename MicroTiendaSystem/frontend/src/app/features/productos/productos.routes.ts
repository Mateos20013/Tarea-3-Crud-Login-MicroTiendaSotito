import { Routes } from '@angular/router';

export const productosRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./productos-list.component').then(m => m.ProductosListComponent)
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./producto-form.component').then(m => m.ProductoFormComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./producto-form.component').then(m => m.ProductoFormComponent)
  }
];
