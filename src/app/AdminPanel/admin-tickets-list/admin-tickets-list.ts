import {
  Component,
  OnInit,
  signal,
  computed,
  effect,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  TicketListItem,
  TicketPriority,
  TicketStatus,
} from '../../Models/ticket.model';
import { SupportService } from '../../Sevices/support.service';

@Component({
  selector: 'app-admin-tickets-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-tickets-list.html',
  styleUrl: './admin-tickets-list.css',
})
export class AdminTicketsList implements OnInit {
  // --------- inject ها ----------
  private supportService = inject(SupportService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef); // ⬅️ مهم برای takeUntilDestroyed

  // ---------- state ----------
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'all' | TicketStatus>('all');
  readonly priorityFilter = signal<'all' | TicketPriority>('all');
  readonly onlyActive = signal(false);

  readonly currentPage = signal(1);
  readonly pageSize = 12;

  readonly tickets = signal<TicketListItem[]>([]);

  // ---------- stats ----------
  readonly stats = computed(() => {
    const list = this.tickets();
    const stats = {
      total: list.length,
      open: 0,
      pending: 0,
      answered: 0,
      closed: 0,
    };

    for (const t of list) {
      if (t.status === 'open') stats.open++;
      else if (t.status === 'pending') stats.pending++;
      else if (t.status === 'answered') stats.answered++;
      else if (t.status === 'closed') stats.closed++;
    }

    return stats;
  });

  // ---------- filter + sort ----------
  private readonly baseFilteredTickets = computed(() => {
    let result = [...this.tickets()];

    if (this.onlyActive()) {
      result = result.filter(
        (t) => t.status === 'open' || t.status === 'pending',
      );
    }

    const status = this.statusFilter();
    if (status !== 'all') {
      result = result.filter((t) => t.status === status);
    }

    const prio = this.priorityFilter();
    if (prio !== 'all') {
      result = result.filter((t) => t.priority === prio);
    }

    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      result = result.filter(
        (t) =>
          String(t.id).includes(term) ||
          t.subject.toLowerCase().includes(term),
      );
    }

    result.sort((a, b) => {
      const aTime = a.last_message_at || a.updated_at || '';
      const bTime = b.last_message_at || b.updated_at || '';
      return bTime.localeCompare(aTime);
    });

    return result;
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.baseFilteredTickets().length / this.pageSize)),
  );

  readonly pagedTickets = computed(() => {
    const list = this.baseFilteredTickets();
    const total = this.totalPages();
    const page = Math.min(this.currentPage(), total);

    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return list.slice(start, end);
  });

  constructor() {
    // اگر صفحه از total بیشتر شد، اصلاحش کن
    effect(() => {
      const total = this.totalPages();
      const page = this.currentPage();
      if (page > total) {
        this.currentPage.set(total);
      }
    });
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  private loadTickets(): void {
    this.loading.set(true);
    this.error.set(null);

    this.supportService
      .listTickets()
      .pipe(takeUntilDestroyed(this.destroyRef)) // ⬅️ این‌طوری در Angular 21
      .subscribe({
        next: (items) => {
          this.tickets.set(items);
          this.loading.set(false);
          // برای تست:
          // console.log('tickets from backend:', items);
        },
        error: (err) => {
          console.error('خطا در دریافت لیست تیکت‌ها (ادمین)', err);
          this.error.set('دریافت تیکت‌ها با خطا مواجه شد.');
          this.loading.set(false);
        },
      });
  }

  // ---------- handlers ----------
  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onStatusChange(value: 'all' | TicketStatus) {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  onPriorityChange(value: 'all' | TicketPriority) {
    this.priorityFilter.set(value);
    this.currentPage.set(1);
  }

  toggleOnlyActive(checked: boolean) {
    this.onlyActive.set(checked);
    this.currentPage.set(1);
  }

  resetFilters() {
    this.searchTerm.set('');
    this.statusFilter.set('all');
    this.priorityFilter.set('all');
    this.onlyActive.set(false);
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    const total = this.totalPages();
    if (page < 1 || page > total) return;
    this.currentPage.set(page);
  }

  // ---------- helpers ----------
  getStatusLabel(s: TicketStatus): string {
    return {
      open: 'باز',
      pending: 'در حال بررسی',
      answered: 'پاسخ داده شده',
      closed: 'بسته شده',
    }[s];
  }

  getPriorityLabel(p: TicketPriority): string {
    return {
      urgent: 'فوری',
      high: 'زیاد',
      normal: 'معمولی',
      low: 'کم',
    }[p];
  }

  getStatusClass(s: TicketStatus): string {
    return {
      open: 'adm-status-pill status-open',
      pending: 'adm-status-pill status-pending',
      answered: 'adm-status-pill status-answered',
      closed: 'adm-status-pill status-closed',
    }[s];
  }

  getPriorityClass(p: TicketPriority): string {
    return {
      urgent: 'adm-priority-pill priority-urgent',
      high: 'adm-priority-pill priority-high',
      normal: 'adm-priority-pill priority-normal',
      low: 'adm-priority-pill priority-low',
    }[p];
  }

  openTicket(ticket: TicketListItem) {
    this.router.navigate(['/admin-panel/tickets', ticket.id]);
  }
}
