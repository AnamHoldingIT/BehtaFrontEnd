import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../Models/user.model';
import { AccountsService } from '../../Sevices/accounts.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],   // ✅ برای ngModel
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {
  users: User[] = [];
  loading = true;
  error: string | null = null;

  // ✅ فیلترها
  searchTerm = '';
  roleFilter: 'all' | 'super_admin' | 'admin' | 'normal' = 'all';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  constructor(
    private accountsService: AccountsService,
    private cdr: ChangeDetectorRef,
    private router : Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading = false;   // همون چیزی که خودت گذاشتی
    this.error = null;

    this.accountsService.getUsers().subscribe({
      next: (users: any) => {
        console.log('Users from API:', users);
        this.users = users.results as User[];   // ریسپانس: {results: [...]}
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Users API error:', err);
        this.error = 'در بارگذاری لیست کاربران خطایی رخ داد.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ✅ لیست فیلتر شده برای جدول
  get filteredUsers(): User[] {
    return this.users
      // فیلتر نقش
      .filter((u) => {
        if (this.roleFilter === 'all') return true;
        return u.role === this.roleFilter;
      })
      // فیلتر وضعیت
      .filter((u) => {
        if (this.statusFilter === 'all') return true;
        if (this.statusFilter === 'active') return u.is_active;
        if (this.statusFilter === 'inactive') return !u.is_active;
        return true;
      })
      // سرچ
      .filter((u) => {
        const term = this.searchTerm.trim().toLowerCase();
        if (!term) return true;

        const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
        return (
          fullName.includes(term) ||
          (u.phone || '').toLowerCase().includes(term) ||
          (u.role || '').toLowerCase().includes(term)
        );
      });
  }

  // حذف کاربر
  onDeleteUser(user: User): void {
    const ok = confirm(
      `آیا از حذف کاربر ${user.first_name} ${user.last_name} با شماره ${user.phone} مطمئن هستید؟`
    );
    if (!ok) return;

    this.accountsService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== user.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('حذف کاربر با خطا مواجه شد.');
      },
    });
  }

  onViewUser(user: User): void {
    this.router.navigate(['/admin-panel/users', user.id]);
  }

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

  getRoleClass(role: User['role']): string {
    return {
      super_admin: 'role-chip role-super',
      admin: 'role-chip role-admin',
      normal: 'role-chip role-normal',
    }[role];
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-chip status-active' : 'status-chip status-inactive';
  }
}
