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

  isLoading = true;
  isSaving = false;
  isEditing = false;

  user: User | null = null;
  profile: UserProfile | null = null;

  email: string = '';
  address: string = '';
  isOperator: boolean = false;

  contractAmountToman: number | null = null; // ✅ جدید

  avatarPreview: string | null = null;
  selectedAvatarFile: File | null = null;

  constructor(
    private accountsService: AccountsService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserFromStorage();
    this.fetchProfileFromServer();
  }

  private loadUserFromStorage(): void {
    try {
      const raw = localStorage.getItem('authUser');
      if (raw) this.user = JSON.parse(raw);
    } catch {}
  }

  private fetchProfileFromServer(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.accountsService.getMyProfile().subscribe({
      next: (profile) => {
        this.applyProfile(profile);
        localStorage.setItem('myProfile', JSON.stringify(profile));
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (err.status === 401) this.authService.logOut();
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private applyProfile(profile: UserProfile): void {
    this.profile = profile;
    this.email = profile.email ?? '';
    this.address = profile.address ?? '';
    this.isOperator = profile.is_operator;
    this.contractAmountToman = profile.contract_amount_toman ?? null;
    this.avatarPreview = profile.avatar || null;
  }

  onEditClick(): void {
    if (this.isLoading || this.isSaving) return;
    if (!this.isEditing) {
      this.isEditing = true;
      return;
    }
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

      if (this.isOperator && this.contractAmountToman !== null) {
        formData.append(
          'contract_amount_toman',
          String(this.contractAmountToman)
        );
      }

      formData.append('avatar', this.selectedAvatarFile);

      this.accountsService.updateMyProfile(formData).subscribe({
        next: (updated) => this.handleSaveSuccess(updated),
        error: () => {
          this.isSaving = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      const payload = {
        email: this.email,
        address: this.address,
        is_operator: this.isOperator,
        contract_amount_toman: this.isOperator
          ? this.contractAmountToman
          : null,
      };

      this.accountsService.updateMyProfile(payload).subscribe({
        next: (updated) => this.handleSaveSuccess(updated),
        error: () => {
          this.isSaving = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  private handleSaveSuccess(updated: UserProfile): void {
    this.applyProfile(updated);
    localStorage.setItem('myProfile', JSON.stringify(updated));

    this.isSaving = false;
    this.isEditing = false;
    this.selectedAvatarFile = null;
    this.cdr.markForCheck();
  }

  setOperator(isOp: boolean): void {
    if (!this.isEditing) return;
    this.isOperator = isOp;
    if (!isOp) this.contractAmountToman = null;
  }

  onAvatarClick(fileInput: HTMLInputElement): void {
    if (this.isEditing) fileInput.click();
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedAvatarFile = input.files[0];

    const reader = new FileReader();
    reader.onload = e => this.avatarPreview = e.target?.result as string;
    reader.readAsDataURL(this.selectedAvatarFile);
  }

  onLogout(): void {
    this.authService.logOut();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  get fullName(): string {
    return this.user
      ? `${this.user.first_name} ${this.user.last_name}`.trim()
      : '';
  }

  get phone(): string {
    return this.user?.phone ?? '';
  }
}
