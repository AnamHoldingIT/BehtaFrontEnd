import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { PaginatedResponse, PatchNote } from '../../Models/patchnote.model';
import { PatchNotesService } from '../../Sevices/patchnotes.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type StatusFilter = 'all' | PatchNote['status'];

@Component({
  selector: 'app-admin-patchnote-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-patchnote-list.html',
  styleUrl: './admin-patchnote-list.css',
})
export class AdminPatchnoteList implements OnInit {
  // inject-style مثل بقیه‌هات
  private patchNotesService = inject(PatchNotesService);
  private router = inject(Router);

  // --- state با سیگنال‌ها ---
  isLoading = signal(false);
  error = signal<string | null>(null);

  rawPage = signal<PaginatedResponse<PatchNote> | null>(null);
  page = signal(1);
  pageSize = signal(10);

  statusFilter = signal<StatusFilter>('all');
  searchTerm = signal('');
  sortBy = signal<'date' | 'version'>('date');
  sortDir = signal<'asc' | 'desc'>('desc');

  // --- computed‌ها ---
  hasPrev = computed(() => !!this.rawPage()?.previous);
  hasNext = computed(() => !!this.rawPage()?.next);



  statusOptions: StatusFilter[] = [
    'all',
    'new',
    'improvement',
    'bugfix',
    'announcement',
  ];
  visibleNotes = computed<PatchNote[]>(() => {
    const page = this.rawPage();
    if (!page) return [];

    let data = [...page.results];

    // فیلتر وضعیت
    const status = this.statusFilter();
    if (status !== 'all') {
      data = data.filter((n) => n.status === status);
    }

    // سرچ
    const q = this.searchTerm().trim().toLowerCase();
    if (q) {
      data = data.filter((n) => {
        return (
          n.version.toLowerCase().includes(q) ||
          n.title.toLowerCase().includes(q) ||
          (n.subtitle || '').toLowerCase().includes(q)
        );
      });
    }

    // sort
    const sortBy = this.sortBy();
    const dir = this.sortDir();

    data.sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortBy === 'date') {
        valA = a.date;
        valB = b.date;
      } else {
        valA = a.version;
        valB = b.version;
      }

      if (valA === valB) return 0;
      const cmp = valA < valB ? -1 : 1;
      return dir === 'asc' ? cmp : -cmp;
    });

    return data;
  });

  ngOnInit(): void {
    this.loadPage(1);
  }

  // --- متدها ---

  loadPage(page: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.patchNotesService
      .listAdminPatchNotes({
        page,
        page_size: this.pageSize(),
      })
      .subscribe({
        next: (res) => {
          this.rawPage.set(res);
          this.page.set(page);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('خطا در دریافت فهرست نسخه‌ها. لطفاً دوباره تلاش کنید.');
          this.isLoading.set(false);
        },
      });
  }

  changePage(delta: number): void {
    const nextPage = this.page() + delta;
    if (nextPage < 1) return;
    this.loadPage(nextPage);
  }

  statusLabel(status: StatusFilter): string {
    if (status === 'all') return 'همه وضعیت‌ها';
    switch (status) {
      case 'new':
        return 'ویژگی جدید';
      case 'improvement':
        return 'بهبود';
      case 'bugfix':
        return 'رفع باگ';
      case 'announcement':
        return 'اعلان';
      default:
        return status;
    }
  }

  statusPillClass(note: PatchNote): string {
    switch (note.status) {
      case 'new':
        return 'status-pill status-new';
      case 'improvement':
        return 'status-pill status-improvement';
      case 'bugfix':
        return 'status-pill status-bugfix';
      case 'announcement':
        return 'status-pill status-announcement';
      default:
        return 'status-pill';
    }
  }

  rowAccentClass(note: PatchNote): string {
    if (note.is_latest) return 'row-latest';
    if (note.status === 'bugfix') return 'row-bugfix';
    if (note.status === 'new') return 'row-new';
    return '';
  }

  goToDetails(id: number | 'new'): void {
    this.router.navigate(['/admin-panel/patchnotes', id]);
  }
}
