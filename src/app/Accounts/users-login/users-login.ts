import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { AuthErrorService } from '../service/auth-error.service';
import { Router, RouterLink } from '@angular/router';
import { AccountsService } from '../../Sevices/accounts.service';
import { LoginRequest } from '../../Models/login-request.model';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthResponse } from '../../Models/auth-response.model';
import { ApiResponse } from '../../Models/api-response.model';
import { AuthService } from '../../Sevices/auth.service';

@Component({
  selector: 'app-users-login',
  imports: [NgClass, RouterLink, FormsModule, CommonModule],
  templateUrl: './users-login.html',
  styleUrl: './users-login.css',
})
export class UsersLogin {
  passwordVisible = false;
  errorMessage = '';

  loginData: LoginRequest = {
    phone: '',
    password: '',
  };

  constructor(
    private authError: AuthErrorService,
    private accountsService: AccountsService,
    private router: Router ,
    private authService : AuthService,
  ) { }

  get passwordInputType(): 'text' | 'password' {
    return this.passwordVisible ? 'text' : 'password';
  }

  get passwordIconClass(): string {
    return this.passwordVisible ? 'bi-eye-slash' : 'bi-eye';
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.authError.showError('لطفاً فرم را به‌درستی تکمیل کن');
      return;
    }

    this.errorMessage = '';

    this.accountsService.login(this.loginData).subscribe(
      (response: ApiResponse<AuthResponse>) => {
        console.log('Login response:', response);

        if (response.success && response.data) {
          const auth = response.data;

          this.authService.setToken(auth.token);       // ✅ این مهمه
          localStorage.setItem('authUser', JSON.stringify(auth.user));
          localStorage.setItem('authRole', auth.role);

          this.router.navigate(['/']); // یا هر روتی که می‌خوای بعد لاگین بری
        } else {
          const msg = response.message || 'ورود ناموفق بود.';
          this.errorMessage = msg;
          this.authError.showError(msg);
        }
      },
      (error) => {
        console.error('Login error:', error);
        // پیام از سمت بک‌اند (ValidationError یا هرچیز)
        const msg =
          error?.error?.message ||
          error?.error?.detail ||
          (Array.isArray(error?.error?.non_field_errors)
            ? error.error.non_field_errors[0]
            : 'شماره موبایل یا رمز عبور صحیح نیست');
        this.errorMessage = msg;
        this.authError.showError(msg);
      }
    );
  }
}
