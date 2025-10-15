import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, startWith, map } from 'rxjs';
import { VentasService } from '../../core/services/ventas.service';
import { ProductosService } from '../../core/services/productos.service';
import { Producto, CreateVenta, CreateVentaDetalle } from '../../core/models';

@Component({
  selector: 'app-venta-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>add_shopping_cart</mat-icon>
            Nueva Venta
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          }

          <form [formGroup]="ventaForm">
            <!-- Información General -->
            <div class="section">
              <h3>Información General</h3>
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Método de Pago</mat-label>
                  <mat-select formControlName="metodoPago" required>
                    <mat-option value="Efectivo">Efectivo</mat-option>
                    <mat-option value="Tarjeta">Tarjeta</mat-option>
                    <mat-option value="Transferencia">Transferencia</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Descuento General (%)</mat-label>
                  <input matInput type="number" min="0" max="100" 
                         formControlName="descuentoGeneral"
                         (input)="recalcularTotales()">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Observaciones</mat-label>
                  <textarea matInput formControlName="observaciones" rows="3"></textarea>
                </mat-form-field>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Productos -->
            <div class="section">
              <div class="section-header">
                <h3>Productos</h3>
                <button mat-icon-button type="button" (click)="agregarProducto()" color="primary">
                  <mat-icon>add_circle</mat-icon>
                </button>
              </div>

              <!-- Selector de Producto -->
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Buscar Producto</mat-label>
                  <input matInput
                         [formControl]="productoSearchControl"
                         [matAutocomplete]="auto"
                         placeholder="Escriba el nombre del producto...">
                  <mat-autocomplete #auto="matAutocomplete" 
                                    [displayWith]="displayProducto"
                                    (optionSelected)="onProductoSelected($event)">
                    @for (producto of filteredProductos$ | async; track producto.productoId) {
                      <mat-option [value]="producto">
                        <div class="producto-option">
                          <span class="nombre">{{ producto.nombre }}</span>
                          <span class="precio">{{ producto.precio | currency:'USD':'symbol':'1.2-2' }}</span>
                          <span class="stock">Stock: {{ producto.stock }}</span>
                        </div>
                      </mat-option>
                    }
                  </mat-autocomplete>
                </mat-form-field>
              </div>

              <!-- Tabla de Productos -->
              <div class="table-container">
                <table mat-table [dataSource]="dataSource()" class="full-width-table">
                  <ng-container matColumnDef="producto">
                    <th mat-header-cell *matHeaderCellDef>Producto</th>
                    <td mat-cell *matCellDef="let detalle; let i = index">
                      {{ getProductoNombre(i) }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="cantidad">
                    <th mat-header-cell *matHeaderCellDef>Cantidad</th>
                    <td mat-cell *matCellDef="let detalle; let i = index">
                      <mat-form-field appearance="outline" class="small-field">
                        <input matInput type="number" min="1" 
                               [value]="getCantidadControl(i).value"
                               (input)="updateCantidad(i, $event)">
                      </mat-form-field>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="precio">
                    <th mat-header-cell *matHeaderCellDef>Precio Unit.</th>
                    <td mat-cell *matCellDef="let detalle; let i = index">
                      {{ getPrecioUnitario(i) | currency:'USD':'symbol':'1.2-2' }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="descuento">
                    <th mat-header-cell *matHeaderCellDef>Desc. (%)</th>
                    <td mat-cell *matCellDef="let detalle; let i = index">
                      <mat-form-field appearance="outline" class="small-field">
                        <input matInput type="number" min="0" max="100" 
                               [value]="getDescuentoControl(i).value"
                               (input)="updateDescuento(i, $event)">
                      </mat-form-field>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="subtotal">
                    <th mat-header-cell *matHeaderCellDef>Subtotal</th>
                    <td mat-cell *matCellDef="let detalle; let i = index">
                      <strong>{{ calcularSubtotalDetalle(i) | currency:'USD':'symbol':'1.2-2' }}</strong>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="acciones">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let detalle; let i = index">
                      <button mat-icon-button color="warn" 
                              (click)="eliminarDetalle(i)"
                              type="button">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>
              </div>

              @if (detalles.length === 0) {
                <div class="no-products">
                  <mat-icon>shopping_cart_outlined</mat-icon>
                  <p>No hay productos agregados</p>
                </div>
              }
            </div>

            <mat-divider></mat-divider>

            <!-- Totales -->
            <div class="section">
              <h3>Resumen</h3>
              <div class="totales">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>{{ subtotal() | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
                <div class="total-row">
                  <span>Descuento:</span>
                  <span>{{ descuentoTotal() | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
                <div class="total-row">
                  <span>Impuesto (19%):</span>
                  <span>{{ impuesto() | currency:'USD':'symbol':'1.2-2' }}</span>
                </div>
                <div class="total-row final">
                  <span><strong>Total:</strong></span>
                  <span><strong>{{ total() | currency:'USD':'symbol':'1.2-2' }}</strong></span>
                </div>
              </div>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button type="button" (click)="cancelar()">
            <mat-icon>cancel</mat-icon>
            Cancelar
          </button>
          <button mat-raised-button color="primary" 
                  [disabled]="ventaForm.invalid || detalles.length === 0 || loading()"
                  (click)="guardarVenta()">
            <mat-icon>save</mat-icon>
            Guardar Venta
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 1rem;
    }

    .section {
      margin: 2rem 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
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

    .table-container {
      margin: 1rem 0;
      overflow-x: auto;
    }

    .full-width-table {
      width: 100%;
    }

    .small-field {
      width: 80px;
    }

    .producto-option {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .producto-option .nombre {
      font-weight: 500;
    }

    .producto-option .precio {
      color: #2196f3;
      font-weight: 500;
    }

    .producto-option .stock {
      font-size: 0.8rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .no-products {
      text-align: center;
      padding: 2rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .no-products mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
    }

    .totales {
      max-width: 300px;
      margin-left: auto;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .total-row.final {
      border-top: 2px solid #2196f3;
      border-bottom: 2px solid #2196f3;
      margin-top: 1rem;
      font-size: 1.2rem;
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
export class VentaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ventasService = inject(VentasService);
  private productosService = inject(ProductosService);
  private router = inject(Router);

  loading = signal(false);
  productos = signal<Producto[]>([]);
  productosSeleccionados = signal<Producto[]>([]);
  dataSource = signal<any[]>([]);

  productoSearchControl = this.fb.control('');
  filteredProductos$!: Observable<Producto[]>;

  ventaForm: FormGroup = this.fb.group({
    metodoPago: ['Efectivo', Validators.required],
    observaciones: [''],
    descuentoGeneral: [0, [Validators.min(0), Validators.max(100)]],
    detalles: this.fb.array([])
  });

  displayedColumns = ['producto', 'cantidad', 'precio', 'descuento', 'subtotal', 'acciones'];

  // Computed values con effect para forzar recálculo
  subtotal = computed(() => {
    // Usar dataSource para forzar reactividad
    const items = this.dataSource();
    let sum = 0;
    for (let i = 0; i < this.detalles.length; i++) {
      sum += this.calcularSubtotalDetalle(i);
    }
    console.log('💰 Subtotal calculado:', sum);
    return sum;
  });

  descuentoTotal = computed(() => {
    const descuentoGeneral = this.ventaForm.get('descuentoGeneral')?.value || 0;
    const desc = this.subtotal() * (descuentoGeneral / 100);
    console.log('🏷️ Descuento total calculado:', desc);
    return desc;
  });

  impuesto = computed(() => {
    const imp = (this.subtotal() - this.descuentoTotal()) * 0.19;
    console.log('📊 Impuesto calculado:', imp);
    return imp;
  });

  total = computed(() => {
    const tot = this.subtotal() - this.descuentoTotal() + this.impuesto();
    console.log('🧮 Total calculado:', tot);
    return tot;
  });

  ngOnInit(): void {
    this.setupAutocomplete();
    this.cargarProductos();
  }

  get detalles() {
    return this.ventaForm.get('detalles') as FormArray;
  }

  setupAutocomplete(): void {
    this.filteredProductos$ = this.productoSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
        const productos = this.productos();
        console.log('🔍 Autocomplete - Productos disponibles:', productos.length);
        console.log('🔍 Autocomplete - Filtro:', filterValue);
        const filtered = productos.filter(producto => 
          producto.nombre.toLowerCase().includes(filterValue) && 
          producto.stock > 0 &&
          producto.activo !== false
        );
        console.log('✅ Autocomplete - Productos filtrados:', filtered.length);
        return filtered;
      })
    );
  }

  cargarProductos(): void {
    console.log('🔍 VentaForm - Iniciando carga de productos...');
    this.loading.set(true);
    this.productosService.getProductos({ activo: true }).subscribe({
      next: (productos) => {
        console.log('✅ VentaForm - Productos cargados:', productos);
        console.log('📊 VentaForm - Cantidad de productos:', productos.length);
        if (productos && productos.length > 0) {
          console.log('📦 VentaForm - Primer producto:', productos[0]);
        }
        this.productos.set(productos);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ VentaForm - Error al cargar productos:', error);
        this.loading.set(false);
      }
    });
  }

  displayProducto(producto: Producto | null): string {
    return producto ? producto.nombre : '';
  }

  onProductoSelected(event: any): void {
    console.log('🎯 Producto seleccionado del autocomplete:', event);
    const producto = event.option.value as Producto;
    console.log('📦 Producto a agregar:', producto);
    this.agregarProductoDetalle(producto);
    this.productoSearchControl.setValue('');
  }

  agregarProducto(): void {
    // Método alternativo para agregar productos manualmente
    console.log('⚠️ Agregar producto manualmente - No implementado');
  }

  agregarProductoDetalle(producto: Producto): void {
    console.log('➕ agregarProductoDetalle llamado con:', producto);
    
    // Verificar que el producto no esté ya agregado
    const existingIndex = this.detalles.controls.findIndex((control: any) => 
      control.get('productoId')?.value === producto.productoId
    );

    if (existingIndex >= 0) {
      console.log('✏️ Producto ya existe, incrementando cantidad en índice:', existingIndex);
      // Si ya existe, incrementar cantidad
      const cantidadControl = this.getCantidadControl(existingIndex);
      cantidadControl.setValue(cantidadControl.value + 1);
      this.onCantidadChange(existingIndex);
      return;
    }

    console.log('🆕 Agregando nuevo producto al detalle');
    
    // Agregar nuevo detalle
    const detalleForm = this.fb.group({
      productoId: [producto.productoId, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      descuento: [0, [Validators.min(0), Validators.max(100)]]
    });

    this.detalles.push(detalleForm);
    
    // Agregar producto a la lista de seleccionados
    const currentProducts = this.productosSeleccionados();
    this.productosSeleccionados.set([...currentProducts, producto]);
    
    // Actualizar dataSource para la tabla
    this.dataSource.set([...this.detalles.controls]);
    
    console.log('✅ Producto agregado. Total de detalles:', this.detalles.length);
    console.log('✅ Productos seleccionados:', this.productosSeleccionados().length);
    console.log('✅ DataSource actualizado:', this.dataSource().length);
    
    this.recalcularTotales();
  }

  eliminarDetalle(index: number): void {
    this.detalles.removeAt(index);
    
    // Remover de productos seleccionados
    const currentProducts = this.productosSeleccionados();
    currentProducts.splice(index, 1);
    this.productosSeleccionados.set([...currentProducts]);
    
    // Actualizar dataSource
    this.dataSource.set([...this.detalles.controls]);
    
    this.recalcularTotales();
  }

  getCantidadControl(index: number) {
    return this.detalles.at(index).get('cantidad')!;
  }

  getDescuentoControl(index: number) {
    return this.detalles.at(index).get('descuento')!;
  }

  getProductoNombre(index: number): string {
    const producto = this.productosSeleccionados()[index];
    return producto ? producto.nombre : '';
  }

  getPrecioUnitario(index: number): number {
    const producto = this.productosSeleccionados()[index];
    return producto ? producto.precio : 0;
  }

  calcularSubtotalDetalle(index: number): number {
    const detalle = this.detalles.at(index);
    if (!detalle) return 0;

    const cantidad = detalle.get('cantidad')?.value || 0;
    const precio = this.getPrecioUnitario(index);
    const descuento = detalle.get('descuento')?.value || 0;
    
    const subtotal = cantidad * precio;
    return subtotal - (subtotal * descuento / 100);
  }

  updateCantidad(index: number, event: any): void {
    const cantidad = parseInt(event.target.value) || 0;
    const detalle = this.detalles.at(index);
    const producto = this.productosSeleccionados()[index];

    // Validar stock
    if (producto && cantidad > producto.stock) {
      detalle.get('cantidad')?.setValue(producto.stock);
      event.target.value = producto.stock;
    } else {
      detalle.get('cantidad')?.setValue(cantidad);
    }

    this.recalcularTotales();
  }

  updateDescuento(index: number, event: any): void {
    const descuento = parseFloat(event.target.value) || 0;
    const detalle = this.detalles.at(index);
    detalle.get('descuento')?.setValue(descuento);
    this.recalcularTotales();
  }

  onCantidadChange(index: number): void {
    const detalle = this.detalles.at(index);
    const producto = this.productosSeleccionados()[index];
    const cantidad = detalle.get('cantidad')?.value || 0;

    // Validar stock
    if (producto && cantidad > producto.stock) {
      detalle.get('cantidad')?.setValue(producto.stock);
    }

    this.recalcularTotales();
  }

  recalcularTotales(): void {
    // Forzar actualización del dataSource para que los computed reaccionen
    this.dataSource.set([...this.detalles.controls]);
    console.log('🔄 Totales recalculados. DataSource actualizado:', this.dataSource().length);
  }

  guardarVenta(): void {
    if (this.ventaForm.invalid || this.detalles.length === 0) {
      this.ventaForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const ventaData: CreateVenta = {
      metodoPago: this.ventaForm.get('metodoPago')?.value,
      observaciones: this.ventaForm.get('observaciones')?.value || '',
      descuento: this.descuentoTotal(),
      impuesto: this.impuesto(),
      detalles: this.detalles.controls.map((control: any, index: any) => ({
        productoId: control.get('productoId')?.value,
        cantidad: control.get('cantidad')?.value,
        descuento: control.get('descuento')?.value || 0
      }))
    };

    this.ventasService.createVenta(ventaData).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/ventas']);
      },
      error: (error: any) => {
        console.error('Error al guardar venta:', error);
        this.loading.set(false);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/ventas']);
  }
}
