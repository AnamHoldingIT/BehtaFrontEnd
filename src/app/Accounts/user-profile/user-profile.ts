import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountsService } from '../../Sevices/accounts.service';
import { AuthService } from '../../Sevices/auth.service';
import { UserProfile } from '../../Models/user-profile.model';
import { User } from '../../Models/user.model';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfileComponent implements OnInit {

  // حالات UI
  isLoading = true;   // تا وقتی از سرور پروفایل میاد
  isSaving = false;
  isEditing = false;

  // یوزر از auth (اسم، فامیل، شماره...)
  user: User | null = null;

  // پروفایل از سرور
  profile: UserProfile | null = null;

  // فیلدهای فرم (دوطرفه با ngModel)
  email: string = '';
  address: string = '';
  isOperator: boolean = false;

  // آواتار
  avatarPreview: string | null = null;
  selectedAvatarFile: File | null = null;

  constructor(
    private accountsService: AccountsService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // اطلاعات پایه کاربر از authUser (فقط برای نمایش اسم/شماره)
    this.loadUserFromStorage();

    // پروفایل کامل را از سرور بگیر
    this.fetchProfileFromServer();
  }

  // ---------- User از localStorage (فقط برای نمایش نام / شماره) ----------

  private loadUserFromStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = localStorage.getItem('authUser');
      if (raw) {
        this.user = JSON.parse(raw) as User;
      }
    } catch (e) {
      console.error('Error parsing authUser from localStorage', e);
    }
  }

  // ---------- پروفایل از سرور (منبع اصلی حقیقت) ----------

  private fetchProfileFromServer(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.accountsService.getMyProfile().subscribe({
      next: (profile) => {
        // پروفایل دریافتی از سرور رو روی فرم بنویس
        this.applyProfile(profile);

        // همزمان تو localStorage هم ذخیره کن (برای استفاده‌های بعدی یا دیباگ)
        this.saveProfileToStorage(profile);

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading profile from server', err);
        this.isLoading = false;

        if (err.status === 401) {
          this.authService.logOut();
        }

        this.cdr.markForCheck();
      }
    });
  }

  // پروفایل رو روی state و فیلدهای فرم اعمال کن
  private applyProfile(profile: UserProfile): void {
    this.profile = profile;
    this.email = profile.email ?? '';
    this.address = profile.address ?? '';
    this.isOperator = profile.is_operator;
    this.avatarPreview = profile.avatar || null;
  }

  // پروفایل رو در localStorage ذخیره کن (mirror)
  private saveProfileToStorage(profile: UserProfile): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('myProfile', JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile to localStorage', e);
    }
  }

  // ---------- دکمه ویرایش / ذخیره ----------

  onEditClick(): void {
    // اگر هنوز پروفایل از سرور نیامده یا در حال ذخیره هستیم، کاری نکن
    if (this.isLoading || this.isSaving) {
      return;
    }

    if (!this.isEditing) {
      // ورود به حالت ویرایش
      this.isEditing = true;
      this.cdr.markForCheck();
      return;
    }

    // در حالت ویرایش → کلیک یعنی ذخیره
    this.saveProfile();
  }

  private saveProfile(): void {
    this.isSaving = true;
    this.cdr.markForCheck();

    if (this.selectedAvatarFile) {
      const formData = new FormData();
      formData.append('email', this.email);
      formData.append('address', this.address);
      formData.append('is_operator', String(this.isOperator));
      formData.append('avatar', this.selectedAvatarFile);

      this.accountsService.updateMyProfile(formData).subscribe({
        next: (updated) => {
          this.handleSaveSuccess(updated);
        },
        error: (err) => {
          console.error('Error updating profile with image', err);
          this.isSaving = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      const payload = {
        email: this.email,
        address: this.address,
        is_operator: this.isOperator,
      };

      this.accountsService.updateMyProfile(payload).subscribe({
        next: (updated) => {
          this.handleSaveSuccess(updated);
        },
        error: (err) => {
          console.error('Error updating profile', err);
          this.isSaving = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  private handleSaveSuccess(updated: UserProfile): void {
    // پاسخ سرور رو منبع اصلی قرار بده
    this.applyProfile(updated);

    // در localStorage هم همزمان آپدیت کن
    this.saveProfileToStorage(updated);

    // ریست حالت فرم
    this.isSaving = false;
    this.isEditing = false;
    this.selectedAvatarFile = null;

    this.cdr.markForCheck();
  }

  // ---------- متصدی بودن ----------

  setOperator(isOp: boolean): void {
    if (!this.isEditing) return;
    this.isOperator = isOp;
    this.cdr.markForCheck();
  }

  // ---------- آواتار ----------

  onAvatarClick(fileInput: HTMLInputElement): void {
    if (!this.isEditing) return;
    fileInput.click();
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedAvatarFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreview = e.target?.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  // ---------- دکمه خروج ----------

  onLogout(): void {
    this.authService.logOut();
  }

  // ---------- برگشت ----------

  goBack(): void {
    this.router.navigate(['/']);
  }

  // ---------- getter ها ----------

  get fullName(): string {
    if (!this.user) return '';
    return `${this.user.first_name} ${this.user.last_name}`.trim();
  }

  get phone(): string {
    return this.user?.phone ?? '';
  }
}
