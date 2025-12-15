import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { AuthResponse } from '../Models/auth-response.model';
import { UserProfile } from '../Models/user-profile.model';
import { User } from '../Models/user.model';
import { SignUpRequest } from '../Models/sign-up-request.model';
import { ApiResponse } from '../Models/api-response.model';
import { UpdateUserProfileRequest } from '../Models/profile-update';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  // پایه‌ی API
  readonly apiBase: string = 'http://127.0.0.1:8000/api/accounts/';
  readonly profileUrl: string = this.apiBase + 'profile/';
  readonly authUrl: string = this.apiBase + 'login/';
  readonly adminAuthUrl: string = this.apiBase + 'admin-login/';
  readonly usersUrl: string = this.apiBase + 'users/';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {}

  // گرفتن هدرهای احراز هویت
  private getAuthHeaders(): HttpHeaders {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No token found, redirecting to login...');
        this.router.navigate(['auth/login']); 
        return new HttpHeaders(); 
      }
      return new HttpHeaders({
        'Authorization': `Token ${token}`
      });
  }

  // ================== احراز هویت ==================

  // لاگین کاربر معمولی
  login(credentials: {
    phone: string;
    password: string;
  }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(this.authUrl, credentials);
  }

  // لاگین ادمین / سوپر ادمین
  adminLogin(credentials: {
    phone: string;
    password: string;
  }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(this.adminAuthUrl, credentials);
  }

  // ثبت‌نام کاربر جدید
  signUp(userData: SignUpRequest): Observable<ApiResponse<User>> {
    // بک‌اندت: success, message, data: user_data, timestamp
    return this.http.post<ApiResponse<User>>(`${this.apiBase}signup/`, userData);
  }

  // خروج از حساب
  logOut(): void {
    this.authService.logOut();
  }

  // ================== پروفایل کاربر لاگین‌شده ==================

  // GET /profile/me/
  getMyProfile(): Observable<UserProfile> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserProfile>(`${this.profileUrl}me/`, { headers });
  }

  // PATCH /profile/me/
  updateMyProfile(
    data: FormData | UpdateUserProfileRequest
  ): Observable<UserProfile> {
    const headers = this.getAuthHeaders();

    if (data instanceof FormData) {
      // برای آپلود آواتار
      return this.http.patch<UserProfile>(`${this.profileUrl}me/`, data, {
        headers, // Content-Type رو خود مرورگر تنظیم می‌کنه
      });
    }

    // JSON معمولی
    return this.http.patch<UserProfile>(`${this.profileUrl}me/`, data, {
      headers: headers.set('Content-Type', 'application/json'),
    });
  }

  // ================== مدیریت کاربران (فقط ادمین‌ها) ==================

  // لیست همه کاربران: GET /api/accounts/users/
  getUsers(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(this.usersUrl, { headers });
  }

  // دریافت یک کاربر خاص: GET /api/accounts/users/:id/
  getUserById(userId: number): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.usersUrl}${userId}/`, { headers });
  }

  // حذف کاربر: DELETE /api/accounts/users/:id/
  deleteUser(userId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.usersUrl}${userId}/`, { headers });
  }

  // به‌روزرسانی اطلاعات کاربر: PUT /api/accounts/users/:id/
  updateUser(userId: number, userData: Partial<User>): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.put<User>(`${this.usersUrl}${userId}/`, userData, {
      headers: headers.set('Content-Type', 'application/json'),
    });
  }
}
