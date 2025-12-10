import { Component, HostListener, OnInit } from '@angular/core';
import { PatchNote, PatchNoteItem } from '../../Models/patchnote.model';
import { PatchNotesService } from '../../Sevices/patchnotes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patchnotes-dialog',
  imports: [FormsModule , CommonModule],
  templateUrl: './patchnotes-dialog.html',
  styleUrl: './patchnotes-dialog.css',
})
export class PatchnotesDialog implements OnInit{
    isOpen = false;
  showNotificationDot = true;

  patchNotes: PatchNote[] = [];
  isLoading = false;
  hasError = false;

  constructor(
    private patchNotesService: PatchNotesService,
  ) {}

  ngOnInit(): void {
    this.loadPatchNotes();
  }

  private loadPatchNotes(): void {
    this.isLoading = true;
    this.hasError = false;

    // از سرویس خودت: listPublicPatchNotesFlat(limit)
    this.patchNotesService
      .listPublicPatchNotesFlat(10)
      .subscribe({
        next: (notes) => {
          this.patchNotes = notes || [];
          this.isLoading = false;

          // اگر هیچ آپدیتی نیست، دکمه نوتیف خاموش
          if (!this.patchNotes.length) {
            this.showNotificationDot = false;
          }
        },
        error: () => {
          this.isLoading = false;
          this.hasError = true;
        },
      });
  }

  openModal(): void {
    if (!this.patchNotes.length) {
      // اگر دوست داشتی اینجا هم دوباره ریلود کنی
      // this.loadPatchNotes();
    }
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    this.showNotificationDot = false;
  }

  closeModal(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
  }

  onOverlayClick(event: MouseEvent): void {
    // ببند فقط اگر روی خود overlay کلیک شده، نه روی محتوا
    if ((event.target as HTMLElement).classList.contains('updates-modal-overlay')) {
      this.closeModal();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen) {
      this.closeModal();
    }
  }

  // ====== Helper ها برای UI ======

  isLatest(index: number): boolean {
    return index === 0;
  }

  // برچسب فارسی برای status
  statusLabel(status: PatchNote['status']): string {
    switch (status) {
      case 'new':
        return 'ویژگی جدید 🔥';
      case 'improvement':
        return 'بهبود عملکرد ⚡️';
      case 'bugfix':
        return 'رفع باگ 🐛';
      case 'announcement':
        return 'اعلان 📢';
      default:
        return 'به‌روزرسانی';
    }
  }

  // کلاس رنگ آیکون‌ها بر اساس icon_type
  iconClass(item: PatchNoteItem): string {
    // می‌تونی اینو هرجوری دوست داری شخصی‌سازی کنی
    if (item.icon_type === 'flash') {
      return 'icon-blue';
    }
    if (item.icon_type === 'bug') {
      return 'icon-blue';
    }
    // بقیه رو طلایی بگیر
    return 'icon-gold';
  }

  // کلاس آیکون bootstrap بر اساس نوع
  iconName(item: PatchNoteItem): string {
    switch (item.icon_type) {
      case 'check':
        return 'bi bi-check-lg';
      case 'flash':
        return 'bi bi-lightning-charge-fill';
      case 'star':
        return 'bi bi-star-fill';
      case 'info':
        return 'bi bi-info-lg';
      case 'bug':
        return 'bi bi-bug-fill';
      default:
        return 'bi bi-dot';
    }
  }

}
