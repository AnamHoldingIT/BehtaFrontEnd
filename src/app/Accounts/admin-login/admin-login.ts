import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountsService } from '../../Sevices/accounts.service';
import { AuthService } from '../../Sevices/auth.service';
import { AuthResponse } from '../../Models/auth-response.model';
import { ApiResponse } from '../../Models/api-response.model';


@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [NgClass, RouterLink, CommonModule,FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {

  // بایند برای فرم
  username: string = '';   // در واقع شماره موبایل مدیر
  password: string = '';

  passwordVisible = false;
  showError = false;
  errorMessage = 'نام کاربری یا رمز عبور مدیر اشتباه است.';
  isLoading = false;

  constructor(
    private accountsService: AccountsService,
    private authService: AuthService,
    private router: Router
  ) {}

  get passwordInputType(): 'text' | 'password' {
    return this.passwordVisible ? 'text' : 'password';
  }

  get passwordIconClass(): string {
    return this.passwordVisible ? 'bi-eye-slash' : 'bi-eye';
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.showGlobalError('نام کاربری و رمز عبور را کامل وارد کن.');
      return;
    }

    this.isLoading = true;

    // چون بک‌اند با phone کار می‌کند:
    this.accountsService.adminLogin({
      phone: this.username,
      password: this.password,
    })
    .subscribe({
      next: (response: ApiResponse<AuthResponse>) => {
        this.isLoading = false;

        if (!response.success || !response.data) {
          this.showGlobalError(response.message || 'ورود ناموفق بود.');
          return;
        }

        const auth = response.data;

        // فقط مدیر / سوپر ادمین / استَف
        if (!auth.is_staff && auth.role !== 'admin' && auth.role !== 'super_admin') {
          this.showGlobalError('شما دسترسی مدیریتی ندارید.');
          return;
        }

        // ذخیره توکن و یوزر
        this.authService.setToken(auth.token);
        localStorage.setItem('authUser', JSON.stringify(auth.user));
        localStorage.setItem('authRole', auth.role);
        

        // هدایت به داشبورد ادمین
        this.router.navigate(['/admin-panel/log/']);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || 'خطا در ارتباط با سرور. بعداً دوباره امتحان کن.';
        this.showGlobalError(msg);
      }
    });
  }

  private showGlobalError(message: string): void {
    this.errorMessage = message;
    this.showError = true;

    setTimeout(() => {
      this.showError = false;
    }, 3500);
  }
}
