import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

import { ProductosService } from '../../core/services/productos.service';
import { Producto } from '../../core/models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    RouterLink
  ],
  template: `
    <div class="productos-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>Gestión de Productos</mat-card-title>
          <mat-card-subtitle>Administra el inventario de tu tienda</mat-card-subtitle>
        </mat-card-header>
        <mat-card-actions>
          <button mat-raised-button color="primary" routerLink="/productos/nuevo">
            <mat-icon>add</mat-icon>
            Nuevo Producto
          </button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="table-card">
        <mat-card-content>
          <!-- Loading State -->
          <div *ngIf="loading" class="loading-state">
            <mat-spinner></mat-spinner>
            <p>Cargando productos...</p>
          </div>

          <div *ngIf="!loading && productos.length === 0" class="empty-state">
            <mat-icon class="empty-icon">inventory</mat-icon>
            <h3>No hay productos registrados</h3>
            <p>Comienza agregando tu primer producto al inventario</p>
            <button mat-raised-button color="primary" routerLink="/productos/nuevo">
              Agregar Producto
            </button>
          </div>

          <div *ngIf="!loading && productos.length > 0" class="products-grid">
            <mat-card *ngFor="let producto of productos" class="product-card">
              <mat-card-header>
                <mat-card-title>{{ producto.nombre }}</mat-card-title>
                <mat-card-subtitle>{{ producto.categoria }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p><strong>Precio:</strong> \${{ producto.precio | number:'1.2-2' }}</p>
                <p><strong>Stock:</strong> {{ producto.stock }} unidades</p>
                <p><strong>Código:</strong> {{ producto.codigoBarra }}</p>
                <p class="description">{{ producto.descripcion }}</p>
                <div class="stock-status" [class.low-stock]="producto.stock <= producto.stockMinimo">
                  <mat-icon>{{ producto.stock <= producto.stockMinimo ? 'warning' : 'check_circle' }}</mat-icon>
                  <span>{{ producto.stock <= producto.stockMinimo ? 'Stock bajo' : 'Stock normal' }}</span>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button [routerLink]="['/productos/editar', producto.productoId]">
                  <mat-icon>edit</mat-icon>
                  Editar
                </button>
                <button mat-button color="warn" (click)="eliminarProducto(producto.productoId)">
                  <mat-icon>delete</mat-icon>
                  Eliminar
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .productos-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 24px;
    }

    .header-card mat-card-header {
      margin-bottom: 16px;
    }

    .table-card {
      min-height: 400px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: #666;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .empty-state p {
      margin-bottom: 24px;
    }

    .loading-state {
      text-align: center;
      padding: 48px 24px;
      color: #666;
    }

    .loading-state mat-spinner {
      margin: 0 auto 16px auto;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      padding: 16px 0;
    }

    .product-card {
      height: fit-content;
    }

    .description {
      color: #666;
      font-size: 14px;
      margin: 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .stock-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 4px;
      background-color: #e8f5e8;
      color: #2e7d32;
      margin-top: 12px;
    }

    .stock-status.low-stock {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .stock-status mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .productos-container {
        padding: 16px;
      }
      
      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductosListComponent implements OnInit {
  productos: Producto[] = [];
  loading = false;

  constructor(
    private productosService: ProductosService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading = true;
    this.productosService.getProductos().subscribe({
      next: (productos) => {
        // Usar setTimeout para evitar NG0100
        setTimeout(() => {
          this.productos = productos || [];
          this.loading = false;
          this.cdr.markForCheck();
          console.log('✅ Productos cargados:', productos.length);
        }, 0);
      },
      error: (error) => {
        console.error('❌ Error al cargar productos:', error);
        setTimeout(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }, 0);
        this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  eliminarProducto(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        titulo: 'Confirmar eliminación',
        mensaje: '¿Estás seguro de que deseas eliminar este producto?',
        textoConfirmar: 'Eliminar',
        textocancelar: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.productosService.deleteProducto(id).subscribe({
          next: () => {
            setTimeout(() => {
              this.loading = false;
              this.cdr.markForCheck();
            }, 0);
            this.snackBar.open('Producto eliminado exitosamente', 'Cerrar', { duration: 3000 });
            this.cargarProductos(); // Recargar la lista
          },
          error: (error) => {
            setTimeout(() => {
              this.loading = false;
              this.cdr.markForCheck();
            }, 0);
            console.error('❌ Error al eliminar producto:', error);
            this.snackBar.open('Error al eliminar producto', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }
}
