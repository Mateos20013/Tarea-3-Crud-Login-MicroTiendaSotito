import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta, CreateVenta } from '../models';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5163/api/Ventas';

  getVentas(params?: {
    fechaInicio?: Date;
    fechaFin?: Date;
    metodoPago?: string;
    page?: number;
    pageSize?: number;
  }): Observable<Venta[]> {
    let httpParams = new HttpParams();
    
    if (params?.fechaInicio) {
      httpParams = httpParams.set('fechaInicio', params.fechaInicio.toISOString());
    }
    if (params?.fechaFin) {
      httpParams = httpParams.set('fechaFin', params.fechaFin.toISOString());
    }
    if (params?.metodoPago) {
      httpParams = httpParams.set('metodoPago', params.metodoPago);
    }
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    return this.http.get<Venta[]>(this.API_URL, { params: httpParams });
  }

  getVenta(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.API_URL}/${id}`);
  }

  createVenta(venta: CreateVenta): Observable<Venta> {
    return this.http.post<Venta>(this.API_URL, venta);
  }

  cancelarVenta(id: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}/cancelar`, {});
  }

  getMetodosPago(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/metodos-pago`);
  }
}
