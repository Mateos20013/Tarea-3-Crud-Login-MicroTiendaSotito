import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { VentasService } from '../../core/services/ventas.service';
import { Venta } from '../../core/models';

@Component({
  selector: 'app-venta-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="container">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      @if (venta(); as ventaData) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>
              <mat-icon>receipt</mat-icon>
              Detalle de Venta #{{ ventaData.ventaId }}
            </mat-card-title>
            <div class="header-actions">
              <button mat-stroked-button (click)="imprimirTicket()">
                <mat-icon>print</mat-icon>
                Imprimir
              </button>
              <button mat-raised-button color="primary" (click)="volver()">
                <mat-icon>arrow_back</mat-icon>
                Volver
              </button>
            </div>
          </mat-card-header>

          <mat-card-content>
            <!-- Información General -->
            <div class="section">
              <h3>Información General</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Fecha:</label>
                  <span>{{ ventaData.fechaVenta | date:'dd/MM/yyyy HH:mm:ss' }}</span>
                </div>
                <div class="info-item">
                  <label>Vendedor:</label>
                  <span>{{ ventaData.nombreUsuario }}</span>
                </div>
                <div class="info-item">
                  <label>Método de Pago:</label>
                  <mat-chip>{{ ventaData.metodoPago }}</mat-chip>
                </div>
                <div class="info-item">
                  <label>Estado:</label>
                  <mat-chip [class]="'estado-' + ventaData.estadoVenta.toLowerCase()">
                    {{ ventaData.estadoVenta }}
                  </mat-chip>
                </div>
                @if (ventaData.observaciones) {
                  <div class="info-item full-width">
                    <label>Observaciones:</label>
                    <span>{{ ventaData.observaciones }}</span>
                  </div>
                }
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Productos -->
            <div class="section">
              <h3>Productos</h3>
              <div class="table-container">
                <table mat-table [dataSource]="ventaData.detalles" class="full-width-table">
                  <ng-container matColumnDef="producto">
                    <th mat-header-cell *matHeaderCellDef>Producto</th>
                    <td mat-cell *matCellDef="let detalle">
                      <div class="producto-info">
                        <span class="nombre">{{ detalle.nombreProducto }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="cantidad">
                    <th mat-header-cell *matHeaderCellDef>Cantidad</th>
                    <td mat-cell *matCellDef="let detalle">
                      <span class="cantidad">{{ detalle.cantidad }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="precioUnitario">
                    <th mat-header-cell *matHeaderCellDef>Precio Unitario</th>
                    <td mat-cell *matCellDef="let detalle">
                      {{ detalle.precioUnitario | currency:'COP':'symbol':'1.0-0' }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="descuento">
                    <th mat-header-cell *matHeaderCellDef>Descuento</th>
                    <td mat-cell *matCellDef="let detalle">
                      @if (detalle.descuento > 0) {
                        <span class="descuento">
                          {{ detalle.descuento | currency:'COP':'symbol':'1.0-0' }}
                        </span>
                      } @else {
                        <span class="no-descuento">--</span>
                      }
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="subtotal">
                    <th mat-header-cell *matHeaderCellDef>Subtotal</th>
                    <td mat-cell *matCellDef="let detalle">
                      <strong>{{ detalle.subTotal | currency:'COP':'symbol':'1.0-0' }}</strong>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Totales -->
            <div class="section">
              <h3>Resumen de Venta</h3>
              <div class="totales">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>{{ ventaData.subTotal | currency:'COP':'symbol':'1.0-0' }}</span>
                </div>
                @if (ventaData.descuento > 0) {
                  <div class="total-row">
                    <span>Descuento:</span>
                    <span class="descuento">-{{ ventaData.descuento | currency:'COP':'symbol':'1.0-0' }}</span>
                  </div>
                }
                <div class="total-row">
                  <span>Impuesto (19%):</span>
                  <span>{{ ventaData.impuesto | currency:'COP':'symbol':'1.0-0' }}</span>
                </div>
                <div class="total-row final">
                  <span><strong>Total Pagado:</strong></span>
                  <span><strong>{{ ventaData.total | currency:'COP':'symbol':'1.0-0' }}</strong></span>
                </div>
              </div>
            </div>

            <!-- Ticket Preview -->
            <div class="section ticket-preview" #ticketContent>
              <h4>Vista Previa del Ticket</h4>
              <div class="ticket">
                <div class="ticket-header">
                  <h3>MICRO TIENDA</h3>
                  <p>Sistema de Ventas</p>
                  <hr>
                </div>
                
                <div class="ticket-info">
                  <p><strong>Ticket:</strong> #{{ ventaData.ventaId }}</p>
                  <p><strong>Fecha:</strong> {{ ventaData.fechaVenta | date:'dd/MM/yyyy HH:mm' }}</p>
                  <p><strong>Vendedor:</strong> {{ ventaData.nombreUsuario }}</p>
                  <hr>
                </div>

                <div class="ticket-items">
                  @for (detalle of ventaData.detalles; track detalle.ventaDetalleId) {
                    <div class="ticket-item">
                      <div class="item-name">{{ detalle.nombreProducto }}</div>
                      <div class="item-details">
                        <span>{{ detalle.cantidad }} x {{ detalle.precioUnitario | currency:'COP':'symbol':'1.0-0' }}</span>
                        <span class="item-subtotal">{{ detalle.subTotal | currency:'COP':'symbol':'1.0-0' }}</span>
                      </div>
                      @if (detalle.descuento > 0) {
                        <div class="item-discount">Desc: {{ detalle.descuento | currency:'COP':'symbol':'1.0-0' }}</div>
                      }
                    </div>
                  }
                  <hr>
                </div>

                <div class="ticket-totals">
                  <div class="ticket-total">
                    <span>Subtotal:</span>
                    <span>{{ ventaData.subTotal | currency:'COP':'symbol':'1.0-0' }}</span>
                  </div>
                  @if (ventaData.descuento > 0) {
                    <div class="ticket-total">
                      <span>Descuento:</span>
                      <span>-{{ ventaData.descuento | currency:'COP':'symbol':'1.0-0' }}</span>
                    </div>
                  }
                  <div class="ticket-total">
                    <span>Impuesto:</span>
                    <span>{{ ventaData.impuesto | currency:'COP':'symbol':'1.0-0' }}</span>
                  </div>
                  <hr>
                  <div class="ticket-total final">
                    <span><strong>TOTAL:</strong></span>
                    <span><strong>{{ ventaData.total | currency:'COP':'symbol':'1.0-0' }}</strong></span>
                  </div>
                </div>

                <div class="ticket-footer">
                  <p><strong>Método de Pago:</strong> {{ ventaData.metodoPago }}</p>
                  <hr>
                  <p class="thanks">¡Gracias por su compra!</p>
                  <p class="date">{{ ventaData.fechaVenta | date:'dd/MM/yyyy HH:mm:ss' }}</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      } @else if (!loading()) {
        <mat-card>
          <mat-card-content>
            <div class="no-data">
              <mat-icon>error_outline</mat-icon>
              <p>Venta no encontrada</p>
              <button mat-raised-button color="primary" (click)="volver()">
                Volver a Ventas
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
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

    .section {
      margin: 2rem 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item.full-width {
      grid-column: 1 / -1;
    }

    .info-item label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.7);
      font-size: 0.9rem;
    }

    .info-item span {
      font-size: 1rem;
    }

    .table-container {
      margin: 1rem 0;
      overflow-x: auto;
    }

    .full-width-table {
      width: 100%;
    }

    .produto-info {
      display: flex;
      flex-direction: column;
    }

    .nome {
      font-weight: 500;
    }

    .quantidade {
      text-align: center;
      font-weight: 500;
      font-size: 1.1rem;
    }

    .descuento {
      color: #f44336;
    }

    .no-descuento {
      color: rgba(0, 0, 0, 0.4);
    }

    .totales {
      max-width: 400px;
      margin-left: auto;
      margin-top: 1rem;
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

    .no-data {
      text-align: center;
      padding: 3rem;
    }

    .no-data mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: rgba(0, 0, 0, 0.4);
      margin-bottom: 1rem;
    }

    /* Ticket Styles */
    .ticket-preview {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 8px;
    }

    .ticket {
      background: white;
      max-width: 300px;
      margin: 0 auto;
      padding: 1rem;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      line-height: 1.4;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .ticket-header {
      text-align: center;
      margin-bottom: 1rem;
    }

    .ticket-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: bold;
    }

    .ticket-info p {
      margin: 0.2rem 0;
    }

    .ticket-item {
      margin: 0.5rem 0;
    }

    .item-name {
      font-weight: bold;
      margin-bottom: 0.2rem;
    }

    .item-details {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
    }

    .item-discount {
      font-size: 0.75rem;
      color: #666;
      text-align: right;
    }

    .ticket-total {
      display: flex;
      justify-content: space-between;
      margin: 0.2rem 0;
    }

    .ticket-total.final {
      font-weight: bold;
      font-size: 0.95rem;
      margin-top: 0.5rem;
    }

    .ticket-footer {
      text-align: center;
      margin-top: 1rem;
    }

    .thanks {
      font-weight: bold;
      margin: 0.5rem 0;
    }

    .date {
      font-size: 0.75rem;
      color: #666;
    }

    hr {
      border: none;
      border-top: 1px dashed #333;
      margin: 0.5rem 0;
    }

    @media (max-width: 768px) {
      .header-actions {
        flex-direction: column;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }

      .ticket {
        max-width: 100%;
      }
    }

    @media print {
      .container > mat-card > mat-card-header,
      .container > mat-card > mat-card-content > .section:not(.ticket-preview) {
        display: none;
      }
      
      .ticket-preview {
        background: none;
        padding: 0;
      }
      
      .ticket {
        box-shadow: none;
        max-width: none;
      }
    }
  `]
})
export class VentaDetailComponent implements OnInit {
  private ventasService = inject(VentasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  venta = signal<Venta | null>(null);
  loading = signal(false);

  displayedColumns = ['producto', 'cantidad', 'precioUnitario', 'descuento', 'subtotal'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarVenta(+id);
    }
  }

  cargarVenta(id: number): void {
    this.loading.set(true);
    this.ventasService.getVenta(id).subscribe({
      next: (venta) => {
        this.venta.set(venta);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar venta:', error);
        this.loading.set(false);
      }
    });
  }

  imprimirTicket(): void {
    window.print();
  }

  volver(): void {
    this.router.navigate(['/ventas']);
  }
}
