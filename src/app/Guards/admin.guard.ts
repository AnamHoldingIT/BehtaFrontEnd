// src/app/Guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // روی مرورگر هستیم؟
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem('authToken');
  const role  = localStorage.getItem('authRole');

  // اگر توکن نیست → قطعاً لاگین نیست
  if (!token) {
    router.navigate(['/admin-login'], {
      queryParams: { next: state.url },
    });
    return false;
  }

  // فقط این نقش‌ها اجازه ورود دارن
  const allowedRoles = ['admin', 'super_admin', 'staff', 'support'];
  const isAdmin = !!role && allowedRoles.includes(role);

  if (!isAdmin) {
    router.navigate(['/admin-login']);
    return false;
  }

  return true;
};
