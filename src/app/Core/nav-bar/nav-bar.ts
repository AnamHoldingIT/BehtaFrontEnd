import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../Sevices/auth.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar implements OnInit {

  isLoggedIn = false;
  userInitial: string | null = null;

  // فقط روی Browser از اینا استفاده می‌کنیم
  private isBrowser = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  @HostListener('window:scroll')
  onScroll() {
    // روی سرور window نداریم
    if (!this.isBrowser) return;

    const nav = document.getElementById('header');
    if (!nav) return;

    if (window.scrollY > 80) {
      nav.classList.add('navbar-custom-dynamic');
    } else {
      nav.classList.remove('navbar-custom-dynamic');
    }
  }

  ngOnInit(): void {
    // تشخیص اینکه الان روی مرورگریم یا سرور
    this.isBrowser = isPlatformBrowser(this.platformId);

    // روی سرور: نه localStorage داریم، نه window
    if (!this.isBrowser) {
      return;
    }

    // حالت اولیه
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadUserFromStorage();

    // واکنش به لاگین/لاگ‌اوت در لحظه
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      this.loadUserFromStorage();
    });
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) {
      this.userInitial = null;
      return;
    }

    try {
      const raw = localStorage.getItem('authUser');

      if (!raw) {
        this.userInitial = null;
        return;
      }

      const user = JSON.parse(raw);
      const source: string = user.first_name || user.phone || '';
      this.userInitial = source ? source[0] : null;
    } catch (e) {
      console.error('Error reading authUser from localStorage', e);
      this.userInitial = null;
    }
  }

  goToProfile(): void {
    this.router.navigate(['/accounts/profile']); // همون که خودت نوشتی
  }

  logOut(): void {
    this.authService.logOut();
  }

}
