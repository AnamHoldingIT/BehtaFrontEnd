import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY  = 'authUser';
  private readonly ROLE_KEY  = 'authRole';

  private loggedInSubject = new BehaviorSubject<boolean>(this.safeHasToken());
  readonly isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor(private router: Router) {}

  // ---------- helpers برای localStorage (سازگار با SSR) ----------

  private safeHasToken(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private safeGetItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  }

  private safeSetItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  }

  private safeRemoveItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  // ---------- ست کردن سشن کامل (توکن + رول + یوزر) ----------

  /**
   * برای لاگین معمولی/ادمین از این استفاده کن
   */
  setLoginSession(token: string, role?: string, user?: any): void {
    this.safeSetItem(this.TOKEN_KEY, token);

    if (role) {
      this.safeSetItem(this.ROLE_KEY, role);
    }

    if (user) {
      this.safeSetItem(this.USER_KEY, JSON.stringify(user));
    }

    this.loggedInSubject.next(true);
  }

  /**
   * برای سازگاری با کد قدیمی
   * (اگر فقط توکن داری، باز هم سشن رو فعال می‌کنه)
   */
  setToken(token: string): void {
    this.setLoginSession(token);
  }

  // ---------- getter ها ----------

  getToken(): string | null {
    return this.safeGetItem(this.TOKEN_KEY);
  }

  getRole(): string | null {
    return this.safeGetItem(this.ROLE_KEY);
  }

  getCurrentUser(): any | null {
    const raw = this.safeGetItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // ---------- وضعیت لاگین / ادمین ----------

  isLoggedIn(): boolean {
    return this.safeHasToken();
  }

  isAdmin(): boolean {
    const role = this.getRole();
    return role === 'admin' || role === 'super_admin' || role === 'staff' || role === 'support';
  }

  // ---------- خروج ----------

  logOut(): void {
    this.safeRemoveItem(this.TOKEN_KEY);
    this.safeRemoveItem(this.USER_KEY);
    this.safeRemoveItem(this.ROLE_KEY);

    this.loggedInSubject.next(false);
    this.router.navigate(['/accounts/login']); // روت درست
  }

  // ---------- هدر Auth برای HttpClient ----------

  public getAuthHeaders(): HttpHeaders {
    const token = this.getToken();

    if (!token) {
      // اینجا فقط هدر خالی می‌دیم.
      // روتین "اگر لاگین نیست" رو گارد یا اینترسپتور مدیریت کنه.
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Token ${token}`,
    });
  }
}
