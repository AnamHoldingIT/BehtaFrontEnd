import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../Models/user.model';
import { AccountsService } from '../../Sevices/accounts.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush, // مثل پروفایل خودت
})
export class UserDetails implements OnInit {
  avatarPreview: string | null = null;
  user: User | null = null;
  loading = true;
  error: string | null = null;

  deleting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountsService: AccountsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : NaN;

    if (!id || Number.isNaN(id)) {
      this.error = 'شناسه کاربر نامعتبر است.';
      this.loading = false;
      this.cdr.markForCheck(); // 👈 مهم
      return;
    }

    this.loadUser(id);
  }

  private loadUser(id: number): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck(); // 👈 شروع لود

    this.accountsService.getUserById(id).subscribe({
      next: (user: any) => {
        console.log('User details from API:', user);
        this.user = user;

        // 🎯 دقیقا همون استایلی که خودت گفتی و جواب می‌داد
        this.avatarPreview = user.profile?.avatar || null;

        this.loading = false;
        this.cdr.markForCheck(); // 👈 اینجا UI رو آپدیت می‌کنه، دیگه نیازی به کلیک نیست
      },
      error: (err) => {
        console.error('User details API error:', err);
        this.error = 'در بارگذاری جزئیات کاربر خطایی رخ داد.';
        this.loading = false;
        this.cdr.markForCheck(); // 👈 حالت خطا هم فوراً رندر می‌شه
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin-panel/users']);
  }

  // حذف اکانت از همین صفحه
  onDeleteUser(): void {
    if (!this.user || this.deleting) return;

    const ok = confirm(
      `آیا از حذف دائمی حساب کاربر با شماره ${this.user.phone} مطمئن هستید؟ این عملیات قابل بازگشت نیست.`
    );
    if (!ok) return;

    this.deleting = true;
    this.cdr.markForCheck();

    this.accountsService.deleteUser(this.user.id).subscribe({
      next: () => {
        this.deleting = false;
        this.cdr.markForCheck();
        this.router.navigate(['/admin-panel/users']);
      },
      error: (err) => {
        console.error(err);
        this.deleting = false;
        this.cdr.markForCheck();
        alert('حذف کاربر با خطا مواجه شد.');
      },
    });
  }

  // نقش به فارسی
  getRoleLabel(role: User['role']): string {
    switch (role) {
      case 'super_admin':
        return 'سوپر ادمین';
      case 'admin':
        return 'ادمین';
      default:
        return 'کاربر عادی';
    }
  }

  // کلاس نقش
  getRoleClass(role: User['role']): string {
    return {
      super_admin: 'role-chip role-super',
      admin: 'role-chip role-admin',
      normal: 'role-chip role-normal',
    }[role];
  }

  // کلاس وضعیت
  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-chip status-active' : 'status-chip status-inactive';
  }

  // حروف اول اسم برای آواتار (fallback)
  getInitials(user: User | null): string {
    if (!user) return '';
    const first = (user.first_name || '').trim()[0] || '';
    const last = (user.last_name || '').trim()[0] || '';
    const phone = (user.phone || '').toString();
    if (!first && !last && phone) return phone[0];
    return (first + last).toUpperCase();
  }
}
