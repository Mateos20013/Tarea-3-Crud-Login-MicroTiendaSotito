import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js';

import { DashboardService } from '../../core/services/dashboard.service';
import { Dashboard } from '../../core/models';
import { ProductosListComponent } from '../productos/productos-list.component';
import { VentasListComponent } from '../ventas/ventas-list.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    BaseChartDirective,
    ProductosListComponent,
    VentasListComponent
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard de Ventas</h1>
      
      <!-- Debug info (temporal) -->
      <div style="background: #f0f0f0; padding: 8px; margin-bottom: 16px; border-radius: 4px; font-size: 12px;">
        <strong>Debug:</strong> isAdmin = {{isAdmin}} | Usuario: {{currentUser?.nombreCompleto}} | Rol: {{currentUser?.rol}}
      </div>
      
      <!-- Pestañas de navegación -->
      <mat-tab-group [(selectedIndex)]="selectedTabIndex" class="dashboard-tabs">
        <!-- Pestaña Dashboard -->
        <mat-tab label="Dashboard">
          <div class="tab-content">
            <!-- Tarjetas de métricas -->
      <div class="metrics-grid">
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-content">
              <mat-icon class="metric-icon sales">trending_up</mat-icon>
              <div class="metric-info">
                <h3>Ventas Totales</h3>
                <p class="metric-value">\${{ (dashboardData?.estadisticasGenerales?.ventasHoy | number:'1.2-2') || '0.00' }}</p>
                <span class="metric-label">Esta semana</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-content">
              <mat-icon class="metric-icon products">inventory</mat-icon>
              <div class="metric-info">
                <h3>Productos Vendidos</h3>
                <p class="metric-value">{{ dashboardData?.estadisticasGenerales?.totalProductos || 0 }}</p>
                <span class="metric-label">Esta semana</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-content">
              <mat-icon class="metric-icon orders">receipt</mat-icon>
              <div class="metric-info">
                <h3>Órdenes</h3>
                <p class="metric-value">{{ dashboardData?.estadisticasGenerales?.ventasHoyCount || 0 }}</p>
                <span class="metric-label">Esta semana</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-content">
              <mat-icon class="metric-icon avg">monetization_on</mat-icon>
              <div class="metric-info">
                <h3>Venta Promedio</h3>
                <p class="metric-value">\${{ (dashboardData?.estadisticasGenerales?.promedioVentaDiaria | number:'1.2-2') || '0.00' }}</p>
                <span class="metric-label">Por orden</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Gráficos -->
      <div class="charts-grid">
        <!-- Gráfico de ventas por período -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>
              Ventas por Período
              <mat-form-field appearance="outline" class="period-selector">
                <mat-label>Período</mat-label>
                <mat-select [(value)]="selectedPeriod" (selectionChange)="onPeriodChange()">
                  <mat-option value="semanal">Semanal</mat-option>
                  <mat-option value="mensual">Mensual</mat-option>
                  <mat-option value="anual">Anual</mat-option>
                </mat-select>
              </mat-form-field>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas baseChart
              [data]="salesChartData"
              [type]="salesChartType"
              [options]="salesChartOptions">
            </canvas>
          </mat-card-content>
        </mat-card>

        <!-- Gráfico de productos más vendidos -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Productos Más Vendidos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <canvas baseChart
              [data]="productsChartData"
              [type]="productsChartType"
              [options]="productsChartOptions">
            </canvas>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Lista de productos más vendidos -->
      <mat-card class="products-list-card">
        <mat-card-header>
          <mat-card-title>Ranking de Productos</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="products-list">
            <div *ngFor="let producto of dashboardData?.productosMasVendidos; let i = index" class="product-item">
              <div class="product-rank">{{ i + 1 }}</div>
              <div class="product-info">
                <h4>{{ producto.nombreProducto }}</h4>
                <p>Categoría: {{ producto.categoria }}</p>
              </div>
              <div class="product-stats">
                <span class="quantity">{{ producto.cantidadVendida }} vendidos</span>
                <span class="revenue">\${{ producto.totalVentas | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
          </div>
        </mat-tab>
        
        <!-- Pestaña Productos (solo para administradores) -->
        <mat-tab label="Gestión de Productos" *ngIf="isAdmin">
          <div class="tab-content">
            <app-productos-list></app-productos-list>
          </div>
        </mat-tab>
        
        <!-- Pestaña Ventas -->
        <mat-tab label="Gestión de Ventas">
          <div class="tab-content">
            <app-ventas-list></app-ventas-list>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 16px 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      color: #333;
      margin-bottom: 24px;
      font-size: 28px;
      font-weight: 500;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .metric-card {
      height: 120px;
    }

    .metric-content {
      display: flex;
      align-items: center;
      height: 100%;
    }

    .metric-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-right: 16px;
    }

    .metric-icon.sales { color: #4caf50; }
    .metric-icon.products { color: #2196f3; }
    .metric-icon.orders { color: #ff9800; }
    .metric-icon.avg { color: #9c27b0; }

    .metric-info h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .metric-value {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .metric-label {
      font-size: 12px;
      color: #999;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
      margin-bottom: 32px;
    }

    @media (max-width: 1200px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }

    .chart-card {
      padding: 16px;
    }

    .chart-card canvas {
      max-height: 400px;
    }

    .period-selector {
      margin-left: auto;
      width: 120px;
    }

    .period-selector .mat-mdc-form-field-wrapper {
      padding-bottom: 0;
    }

    .products-list-card {
      margin-bottom: 24px;
    }

    .products-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .product-item {
      display: flex;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #eee;
    }

    .product-item:last-child {
      border-bottom: none;
    }

    .product-rank {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #333;
      margin-right: 16px;
    }

    .product-info {
      flex: 1;
    }

    .product-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      color: #333;
    }

    .product-info p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .product-stats {
      text-align: right;
    }

    .quantity {
      display: block;
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }

    .revenue {
      display: block;
      font-size: 16px;
      font-weight: 600;
      color: #4caf50;
    }

    /* Estilos para las pestañas */
    .dashboard-tabs {
      margin-top: 16px;
    }

    .dashboard-tabs ::ng-deep .mat-mdc-tab-group {
      --mdc-tab-indicator-active-indicator-color: #3f51b5;
    }

    .dashboard-tabs ::ng-deep .mat-mdc-tab {
      min-width: 160px;
    }

    .tab-content {
      padding: 24px 0;
    }

    /* Responsividad mejorada */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 8px 16px;
      }
      
      .metrics-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .metric-card {
        height: 100px;
      }
      
      .metric-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }
      
      .dashboard-tabs ::ng-deep .mat-mdc-tab {
        min-width: auto;
        padding: 0 12px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboardData: Dashboard | null = null;
  selectedPeriod: 'semanal' | 'mensual' | 'anual' = 'semanal';
  selectedTabIndex: number = 0;
  isAdmin: boolean = false;
  currentUser: any = null;

  // Configuración del gráfico de ventas
  salesChartType: 'line' = 'line';
  salesChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Ventas',
      data: [],
      borderColor: '#3f51b5',
      backgroundColor: 'rgba(63, 81, 181, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  salesChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  // Configuración del gráfico de productos
  productsChartType: 'doughnut' = 'doughnut';
  productsChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#ff6384',
        '#36a2eb',
        '#cc65fe',
        '#ffce56',
        '#4bc0c0'
      ]
    }]
  };

  productsChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.checkUserRole();
    
    // Escuchar cambios en el usuario actual
    this.authService.currentUser$.subscribe(user => {
      console.log('🔍 Dashboard - Usuario cambió:', user);
      this.currentUser = user;
      this.isAdmin = user?.rol === 'Admin';
      console.log('🔍 Dashboard - Es admin?:', this.isAdmin);
    });
  }

  checkUserRole(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('🔍 Dashboard - Usuario actual:', currentUser);
    console.log('🔍 Dashboard - Rol del usuario:', currentUser?.rol);
    this.currentUser = currentUser;
    this.isAdmin = currentUser?.rol === 'Admin';
    console.log('🔍 Dashboard - Es admin?:', this.isAdmin);
  }

  loadDashboardData(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (data: Dashboard) => {
        this.dashboardData = data;
        this.updateCharts();
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  onPeriodChange(): void {
    // Aquí puedes implementar la lógica para cambiar el período
    this.updateSalesChart();
  }

  private updateCharts(): void {
    this.updateSalesChart();
    this.updateProductsChart();
  }

  private updateSalesChart(): void {
    if (!this.dashboardData) return;

    let salesData;
    let labels: string[] = [];

    switch (this.selectedPeriod) {
      case 'semanal':
        salesData = this.dashboardData.ventasSemanales;
        labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        break;
      case 'mensual':
        salesData = this.dashboardData.ventasMensuales;
        labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
        break;
      case 'anual':
        salesData = this.dashboardData.ventasAnuales;
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        break;
    }

    // Simular datos para el gráfico (en un caso real, estos vendrían del backend)
    const data = labels.map(() => Math.random() * 1000 + 500);

    this.salesChartData = {
      ...this.salesChartData,
      labels: labels,
      datasets: [{
        ...this.salesChartData.datasets[0],
        data: data
      }]
    };
  }

  private updateProductsChart(): void {
    if (!this.dashboardData?.productosMasVendidos) return;

    const top5Products = this.dashboardData.productosMasVendidos.slice(0, 5);
    
    this.productsChartData = {
      ...this.productsChartData,
      labels: top5Products.map((p: any) => p.nombreProducto),
      datasets: [{
        ...this.productsChartData.datasets[0],
        data: top5Products.map((p: any) => p.cantidadVendida)
      }]
    };
  }
}
