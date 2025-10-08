import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dashboard } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5163/api/Dashboard';

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(this.API_URL);
  }
}
