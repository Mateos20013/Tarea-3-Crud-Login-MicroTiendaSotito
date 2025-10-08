import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { VentasService } from '../../core/services/ventas.service';
import { Venta } from '../../core/models';

@Component({
  selector: 'app-ventas-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>shopping_cart</mat-icon>
            Gestión de Ventas
          </mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" routerLink="/ventas/nueva">
              <mat-icon>add</mat-icon>
              Nueva Venta
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <!-- Filtros -->
          <div class="filters">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Buscar</mat-label>
              <input matInput [formControl]="searchControl" 
                     placeholder="Buscar por ID, usuario...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Estado</mat-label>
              <mat-select [formControl]="estadoControl">
                <mat-option value="">Todos</mat-option>
                <mat-option value="Completada">Completada</mat-option>
                <mat-option value="Cancelada">Cancelada</mat-option>
                <mat-option value="Pendiente">Pendiente</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Método de Pago</mat-label>
              <mat-select [formControl]="metodoPagoControl">
                <mat-option value="">Todos</mat-option>
                <mat-option value="Efectivo">Efectivo</mat-option>
                <mat-option value="Tarjeta">Tarjeta</mat-option>
                <mat-option value="Transferencia">Transferencia</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Fecha Desde</mat-label>
              <input matInput [matDatepicker]="fechaDesde" [formControl]="fechaDesdeControl">
              <mat-datepicker-toggle matSuffix [for]="fechaDesde"></mat-datepicker-toggle>
              <mat-datepicker #fechaDesde></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Fecha Hasta</mat-label>
              <input matInput [matDatepicker]="fechaHasta" [formControl]="fechaHastaControl">
              <mat-datepicker-toggle matSuffix [for]="fechaHasta"></mat-datepicker-toggle>
              <mat-datepicker #fechaHasta></mat-datepicker>
            </mat-form-field>

            <button mat-stroked-button (click)="limpiarFiltros()" class="clear-btn">
              <mat-icon>clear</mat-icon>
              Limpiar
            </button>
          </div>

          @if (loading()) {
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          }

          <!-- Tabla -->
          <div class="table-container">
            <table mat-table [dataSource]="ventas()" class="full-width-table">
              <ng-container matColumnDef="ventaId">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let venta">{{ venta.ventaId }}</td>
              </ng-container>

              <ng-container matColumnDef="fechaVenta">
                <th mat-header-cell *matHeaderCellDef>Fecha</th>
                <td mat-cell *matCellDef="let venta">
                  {{ venta.fechaVenta | date:'dd/MM/yyyy HH:mm' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="nombreUsuario">
                <th mat-header-cell *matHeaderCellDef>Usuario</th>
                <td mat-cell *matCellDef="let venta">{{ venta.nombreUsuario }}</td>
              </ng-container>

              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let venta">
                  <strong>{{ venta.total | currency:'COP':'symbol':'1.0-0' }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="metodoPago">
                <th mat-header-cell *matHeaderCellDef>Método Pago</th>
                <td mat-cell *matCellDef="let venta">
                  <mat-chip>{{ venta.metodoPago }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="estadoVenta">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let venta">
                  <mat-chip [class]="'estado-' + venta.estadoVenta.toLowerCase()">
                    {{ venta.estadoVenta }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let venta">
                  <button mat-icon-button 
                          [routerLink]="['/ventas', venta.ventaId]"
                          matTooltip="Ver Detalle">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  @if (venta.estadoVenta === 'Pendiente') {
                    <button mat-icon-button 
                            [routerLink]="['/ventas/editar', venta.ventaId]"
                            matTooltip="Editar"
                            color="primary">
                      <mat-icon>edit</mat-icon>
                    </button>
                  }
                  <button mat-icon-button 
                          (click)="imprimirTicket(venta)"
                          matTooltip="Imprimir Ticket"
                          color="accent">
                    <mat-icon>print</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          @if (ventas().length === 0 && !loading()) {
            <div class="no-data">
              <mat-icon>shopping_cart_outlined</mat-icon>
              <p>No se encontraron ventas</p>
            </div>
          }

          <!-- Paginador -->
          <mat-paginator
            [length]="totalItems()"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[10, 25, 50, 100]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 1rem;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
      align-items: end;
    }

    .filter-field {
      width: 100%;
    }

    .clear-btn {
      height: fit-content;
    }

    .table-container {
      margin: 1rem 0;
      overflow-x: auto;
    }

    .full-width-table {
      width: 100%;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .no-data mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
    }

    .estado-completada {
      background-color: #4caf50;
      color: white;
    }

    .estado-cancelada {
      background-color: #f44336;
      color: white;
    }

    .estado-pendiente {
      background-color: #ff9800;
      color: white;
    }

    mat-chip {
      font-size: 0.75rem;
      min-height: 24px;
    }

    @media (max-width: 768px) {
      .filters {
        grid-template-columns: 1fr;
      }
      
      .header-actions {
        flex-direction: column;
      }
    }
  `]
})
export class VentasListComponent implements OnInit {
  private ventasService = inject(VentasService);
  private router = inject(Router);

  ventas = signal<Venta[]>([]);
  loading = signal(false);
  totalItems = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);

  displayedColumns = [
    'ventaId',
    'fechaVenta', 
    'nombreUsuario',
    'total',
    'metodoPago',
    'estadoVenta',
    'acciones'
  ];

  searchControl = new FormControl('');
  estadoControl = new FormControl('');
  metodoPagoControl = new FormControl('');
  fechaDesdeControl = new FormControl();
  fechaHastaControl = new FormControl();

  ngOnInit(): void {
    this.cargarVentas();
    this.setupFilters();
  }

  setupFilters(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.cargarVentas());

    this.estadoControl.valueChanges.subscribe(() => this.cargarVentas());
    this.metodoPagoControl.valueChanges.subscribe(() => this.cargarVentas());
    this.fechaDesdeControl.valueChanges.subscribe(() => this.cargarVentas());
    this.fechaHastaControl.valueChanges.subscribe(() => this.cargarVentas());
  }

  cargarVentas(): void {
    this.loading.set(true);
    
    const params: any = {
      page: this.currentPage() + 1,
      pageSize: this.pageSize()
    };

    if (this.searchControl.value) {
      params.buscar = this.searchControl.value;
    }

    if (this.estadoControl.value) {
      params.estado = this.estadoControl.value;
    }

    if (this.metodoPagoControl.value) {
      params.metodoPago = this.metodoPagoControl.value;
    }

    if (this.fechaDesdeControl.value) {
      params.fechaDesde = this.fechaDesdeControl.value.toISOString().split('T')[0];
    }

    if (this.fechaHastaControl.value) {
      params.fechaHasta = this.fechaHastaControl.value.toISOString().split('T')[0];
    }

    this.ventasService.getVentas(params).subscribe({
      next: (ventas) => {
        this.ventas.set(ventas);
        this.loading.set(false);
        // En una implementación real, el total vendría del backend
        this.totalItems.set(ventas.length);
      },
      error: (error) => {
        console.error('Error al cargar ventas:', error);
        this.loading.set(false);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.cargarVentas();
  }

  limpiarFiltros(): void {
    this.searchControl.setValue('');
    this.estadoControl.setValue('');
    this.metodoPagoControl.setValue('');
    this.fechaDesdeControl.setValue(null);
    this.fechaHastaControl.setValue(null);
    this.currentPage.set(0);
    this.cargarVentas();
  }

  imprimirTicket(venta: Venta): void {
    // Aquí implementarías la lógica de impresión
    console.log('Imprimir ticket para venta:', venta.ventaId);
    // Podrías abrir una nueva ventana con el ticket formateado
    // o enviar a imprimir directamente
  }
}
