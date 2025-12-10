import { Component } from '@angular/core';
import { AuthErrorService } from '../service/auth-error.service';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { SignUpRequest } from '../../Models/sign-up-request.model';
import { Router, RouterLink } from '@angular/router';
import { AccountsService } from '../../Sevices/accounts.service';
import { ApiResponse } from '../../Models/api-response.model';

@Component({
  selector: 'app-sign-up',
  imports: [NgClass, FormsModule ,RouterLink , CommonModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
    passwordVisible = false;
  confirmPasswordVisible = false;
  errorMessage: string = ''; // پیام خطای جهانی

  signUpData: SignUpRequest = {
    phone: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: ''
  };

  constructor(private accountsService: AccountsService, private router: Router) {}

  // برای نمایش/پنهان کردن رمز عبور
  get passwordType(): 'text' | 'password' {
    return this.passwordVisible ? 'text' : 'password';
  }

  get confirmPasswordType(): 'text' | 'password' {
    return this.confirmPasswordVisible ? 'text' : 'password';
  }

  get passwordIconClass(): string {
    return this.passwordVisible ? 'bi-eye-slash' : 'bi-eye';
  }

  get confirmPasswordIconClass(): string {
    return this.confirmPasswordVisible ? 'bi-eye-slash' : 'bi-eye';
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPassword(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  // متد برای ارسال فرم
onSubmit(signUpForm: NgForm): void {
  if (signUpForm.valid) {
    if (this.signUpData.password !== this.signUpData.password2) {
      this.errorMessage = 'رمز عبور و تکرار آن یکسان نیستند';
      return;
    }

    this.accountsService.signUp(this.signUpData).subscribe(
      (response: any) => {
        // این لاگ حتماً بزن ببینی چی میاد
        console.log('Raw response from backend:', response);

        // همین که request موفق شده یعنی ثبت‌نام اوکی بوده
        console.log('Registration successful:', response.message);

        // فرم رو ریست کن
        signUpForm.resetForm();

        // هدایت به صفحه لاگین
        console.log('Navigating to login...');
        this.router.navigate(['/accounts/login']);
      },
      (error) => {
        console.error('Error during registration:', error);
        this.errorMessage =
          error?.error?.message || 'ثبت‌نام ناموفق بود. لطفاً دوباره تلاش کنید.';
      }
    );
  } else {
    console.log('Form is not valid');
  }
}

}
