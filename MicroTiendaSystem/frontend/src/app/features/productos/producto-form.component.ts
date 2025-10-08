import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { ProductosService } from '../../core/services/productos.service';
import { Producto } from '../../core/models';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>{{ isEditing() ? 'edit' : 'add' }}</mat-icon>
            {{ isEditing() ? 'Editar Producto' : 'Nuevo Producto' }}
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          }

          <form [formGroup]="productoForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="nombre" required>
                @if (productoForm.get('nombre')?.hasError('required') && productoForm.get('nombre')?.touched) {
                  <mat-error>El nombre es requerido</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descripción</mat-label>
                <textarea matInput formControlName="descripcion" rows="3"></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Precio</mat-label>
                <input matInput type="number" step="0.01" formControlName="precio" required>
                @if (productoForm.get('precio')?.hasError('required') && productoForm.get('precio')?.touched) {
                  <mat-error>El precio es requerido</mat-error>
                }
                @if (productoForm.get('precio')?.hasError('min') && productoForm.get('precio')?.touched) {
                  <mat-error>El precio debe ser mayor a 0</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Stock</mat-label>
                <input matInput type="number" formControlName="stock" required>
                @if (productoForm.get('stock')?.hasError('required') && productoForm.get('stock')?.touched) {
                  <mat-error>El stock es requerido</mat-error>
                }
                @if (productoForm.get('stock')?.hasError('min') && productoForm.get('stock')?.touched) {
                  <mat-error>El stock debe ser mayor o igual a 0</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Stock Mínimo</mat-label>
                <input matInput type="number" formControlName="stockMinimo" required>
                @if (productoForm.get('stockMinimo')?.hasError('required') && productoForm.get('stockMinimo')?.touched) {
                  <mat-error>El stock mínimo es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Categoría</mat-label>
                <input matInput formControlName="categoria" required>
                @if (productoForm.get('categoria')?.hasError('required') && productoForm.get('categoria')?.touched) {
                  <mat-error>La categoría es requerida</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Código de Barra</mat-label>
                <input matInput formControlName="codigoBarra" required>
                @if (productoForm.get('codigoBarra')?.hasError('required') && productoForm.get('codigoBarra')?.touched) {
                  <mat-error>El código de barra es requerido</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>URL de Imagen</mat-label>
                <input matInput formControlName="imagenUrl">
              </mat-form-field>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button type="button" (click)="cancelar()">
            <mat-icon>cancel</mat-icon>
            Cancelar
          </button>
          <button mat-raised-button color="primary" 
                  [disabled]="productoForm.invalid || loading()"
                  (click)="onSubmit()">
            <mat-icon>save</mat-icon>
            {{ isEditing() ? 'Actualizar' : 'Guardar' }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 1rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    mat-card-header {
      margin-bottom: 1rem;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    mat-card-actions {
      margin-top: 2rem;
      padding-top: 1rem;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
      }
      
      .half-width {
        width: 100%;
      }
    }
  `]
})
export class ProductoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productosService = inject(ProductosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  isEditing = signal(false);
  productoId: number | null = null;

  productoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', Validators.maxLength(500)],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    stockMinimo: [0, [Validators.required, Validators.min(0)]],
    categoria: ['', [Validators.required, Validators.maxLength(50)]],
    codigoBarra: ['', [Validators.required, Validators.maxLength(50)]],
    imagenUrl: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productoId = +id;
      this.isEditing.set(true);
      this.cargarProducto();
    }
  }

  cargarProducto(): void {
    if (!this.productoId) return;

    this.loading.set(true);
    this.productosService.getProducto(this.productoId).subscribe({
      next: (producto) => {
        this.productoForm.patchValue({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          stock: producto.stock,
          stockMinimo: producto.stockMinimo,
          categoria: producto.categoria,
          codigoBarra: producto.codigoBarra,
          imagenUrl: producto.imagenUrl
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        this.loading.set(false);
        this.router.navigate(['/productos']);
      }
    });
  }

  onSubmit(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const productoData = this.productoForm.value;

    if (this.isEditing()) {
      this.productosService.updateProducto(this.productoId!, productoData).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/productos']);
        },
        error: (error: any) => {
          console.error('Error al actualizar producto:', error);
          this.loading.set(false);
        }
      });
    } else {
      this.productosService.createProducto(productoData).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/productos']);
        },
        error: (error: any) => {
          console.error('Error al crear producto:', error);
          this.loading.set(false);
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/productos']);
  }
}
