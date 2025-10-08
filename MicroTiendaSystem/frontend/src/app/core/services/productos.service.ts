import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, CreateProducto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5163/api/Productos';

  getProductos(params?: {
    buscar?: string;
    categoria?: string;
    activo?: boolean;
    page?: number;
    pageSize?: number;
  }): Observable<Producto[]> {
    let httpParams = new HttpParams();
    
    if (params?.buscar) httpParams = httpParams.set('buscar', params.buscar);
    if (params?.categoria) httpParams = httpParams.set('categoria', params.categoria);
    if (params?.activo !== undefined) httpParams = httpParams.set('activo', params.activo.toString());
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<Producto[]>(this.API_URL, { params: httpParams });
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.API_URL}/${id}`);
  }

  createProducto(producto: CreateProducto): Observable<Producto> {
    return this.http.post<Producto>(this.API_URL, producto);
  }

  updateProducto(id: number, producto: CreateProducto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}`, producto);
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/categorias`);
  }

  getProductosBajoStock(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.API_URL}/stock-bajo`);
  }
}
