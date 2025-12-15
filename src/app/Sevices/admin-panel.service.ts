// src/app/Sevices/admin-panel.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { AdminEventLog, PaginatedResponse } from '../Models/admin-event-log.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminPanelService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api/admin-panel/logs/';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken() || localStorage.getItem('authToken');

    if (!token) {
      console.error('No token found for admin logs, redirecting to login...');
      this.router.navigate(['accounts/login']);
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Token ${token}`,
    });
  }

  /**
   * گرفتن لاگ‌ها با فیلترهای اختیاری:
   * level: info | warn | error
   * critical=1  => فقط warn + error
   * q          => سرچ روی message
   * page       => صفحه‌ی فعلی
   */
  getLogs(options?: {
    level?: 'info' | 'warn' | 'error';
    critical?: boolean;
    q?: string;
    page?: number;
  }): Observable<PaginatedResponse<AdminEventLog>> {
    const headers = this.getAuthHeaders();

    let params = new HttpParams();

    if (options?.level) {
      params = params.set('level', options.level);
    }

    if (options?.critical) {
      params = params.set('critical', '1');
    }

    if (options?.q && options.q.trim() !== '') {
      params = params.set('q', options.q.trim());
    }

    if (options?.page) {
      params = params.set('page', options.page.toString());
    }

    return this.http.get<PaginatedResponse<AdminEventLog>>(this.baseUrl, {
      headers,
      params,
    });
  }
}
