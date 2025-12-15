// src/app/Support/support-my-tickets/support-my-tickets.ts

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Footer } from '../../Core/footer/footer';
import { NavBar } from '../../Core/nav-bar/nav-bar';
import {
  TicketListItem,
  TicketPriority,
  TicketStatus,
} from '../../Models/ticket.model';
import { SupportService } from '../../Sevices/support.service';

@Component({
  selector: 'app-support-my-tickets',
  standalone: true,
  imports: [Footer, NavBar, CommonModule, FormsModule],
  templateUrl: './support-my-tickets.html',
  styleUrl: './support-my-tickets.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportMyTickets implements OnInit {
  // 🔹 state
  readonly loading = signal(true);

  readonly searchTerm = signal('');
  readonly activeStatus = signal<'all' | TicketStatus>('all');
  readonly priorityFilter = signal<'all' | TicketPriority>('all');

  readonly currentPage = signal(1);
  readonly pageSize = 10;

  readonly tickets = signal<TicketListItem[]>([]);

  // 🔹 فیلتر بدون صفحه‌بندی
  private readonly baseFilteredTickets = computed(() => {
    let result = [...this.tickets()];

    // وضعیت
    const status = this.activeStatus();
    if (status !== 'all') {
      result = result.filter(t => t.status === status);
    }

    // اولویت
    const priority = this.priorityFilter();
    if (priority !== 'all') {
      result = result.filter(t => t.priority === priority);
    }

    // جستجو
    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      result = result.filter(
        t =>
          String(t.id).includes(term) ||
          t.subject.toLowerCase().includes(term),
      );
    }

    return result;
  });

  // 🔹 تعداد صفحات
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.baseFilteredTickets().length / this.pageSize)),
  );

  // 🔹 لیست نهایی صفحه فعلی
  readonly filteredTickets = computed(() => {
    const list = this.baseFilteredTickets();
    const total = this.totalPages();
    const page = Math.min(this.currentPage(), total);
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return list.slice(start, end);
  });

  constructor(
    private supportService: SupportService,
    private router: Router,
  ) {
    // اگر page از total بیشتر شد، خودش اصلاح شه
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

    this.supportService.listTickets().subscribe({
      next: items => {
        this.tickets.set(items);
        this.loading.set(false);
      },
      error: err => {
        console.error('خطا در دریافت لیست تیکت‌ها', err);
        this.loading.set(false);
      },
    });
  }

  // ---- فیلترها ----

  setStatusFilter(status: 'all' | TicketStatus) {
    this.activeStatus.set(status);
    this.currentPage.set(1);
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onPriorityChange(value: 'all' | TicketPriority) {
    this.priorityFilter.set(value);
    this.currentPage.set(1);
  }

  resetFilters() {
    this.searchTerm.set('');
    this.activeStatus.set('all');
    this.priorityFilter.set('all');
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    const total = this.totalPages();
    if (page < 1 || page > total) return;
    this.currentPage.set(page);
  }

  // ---- کلاس‌های وضعیت / اولویت ----

  getStatusClass(status: TicketStatus): string {
    return {
      open: 'ticket-status-pill status-open',
      pending: 'ticket-status-pill status-pending',
      answered: 'ticket-status-pill status-answered',
      closed: 'ticket-status-pill status-closed',
    }[status];
  }

  getPriorityClass(priority: TicketPriority): string {
    return {
      urgent: 'priority-pill priority-urgent',
      high: 'priority-pill priority-high',
      normal: 'priority-pill priority-normal',
      low: 'priority-pill priority-low',
    }[priority];
  }

  getPriorityLabel(priority: TicketPriority): string {
    switch (priority) {
      case 'urgent':
        return 'فوری';
      case 'high':
        return 'زیاد';
      case 'normal':
        return 'معمولی';
      case 'low':
        return 'کم';
    }
  }

  // ---- ناوبری ----

  goToSupportHub() {
    this.router.navigate(['/support']);
  }

  goToNewTicket() {
    this.router.navigate(['/support/tickets/new']);
  }

  goToMyTickets() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openTicket(ticket: TicketListItem) {
    this.router.navigate(['/support/tickets', ticket.id]);
  }
}
