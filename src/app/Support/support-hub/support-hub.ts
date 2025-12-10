import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketStats, TicketPriority, TicketStatus, TicketListItem } from '../../Models/ticket.model';
import { NavBar } from "../../Core/nav-bar/nav-bar";
import { Footer } from "../../Core/footer/footer";
import { SupportService } from '../../Sevices/support.service';

@Component({
  selector: 'app-support-hub',
  standalone: true,
  imports: [CommonModule, NavBar, Footer],
  templateUrl: './support-hub.html',
  styleUrl: './support-hub.css',
})
export class SupportHubComponent implements OnInit {
    // آمار از فرانت (محاسبه شده تو SupportService.getTicketStats)
  stats: TicketStats = {
    open: 0,
    pending: 0,
    answered: 0,
    closed: 0,
  };

  loadingStats = true;
  loadingRecent = false;

  // آخرین تیکت‌ها ـ مستقیم از API، بدون map اضافه
  recentTickets: TicketListItem[] = [];

  constructor(
    private router: Router,
    private supportService: SupportService,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentTickets();
  }

  // ---------- API Calls ----------

  private loadStats(): void {
    this.loadingStats = false;

    this.supportService.getTicketStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loadingStats = false;
      },
      error: (err) => {
        console.error('خطا در دریافت آمار تیکت‌ها', err);
        this.loadingStats = false;
      },
    });
  }

  private loadRecentTickets(): void {
    this.loadingRecent = true;

    this.supportService.listTickets({ page: 1 }).subscribe({
      next: (tickets: TicketListItem[]) => {
        // فقط ۳ تا آخر رو نشون می‌دیم
        this.recentTickets = tickets.slice(0, 3);
        this.loadingRecent = false;
      },
      error: (err) => {
        console.error('خطا در دریافت تیکت‌های اخیر', err);
        this.loadingRecent = false;
      },
    });
  }

  // ---------- Navigation ----------

  goToNewTicket(): void {
    this.router.navigate(['/support/tickets/new']);
  }

  goToMyTickets(): void {
    this.router.navigate(['/support/tickets']);
  }

  goToFaq(): void {
    this.router.navigate(['/support/faq']);
  }

  openTicket(ticket: TicketListItem): void {
    this.router.navigate(['/support/tickets', ticket.id]);
  }

  // ---------- UI helpers ----------

  getStatusClass(status: TicketStatus): string {
    switch (status) {
      case 'open':
        return 'ticket-status-pill status-open';
      case 'pending':
        return 'ticket-status-pill status-pending';
      case 'answered':
        return 'ticket-status-pill status-answered';
      case 'closed':
        return 'ticket-status-pill status-closed';
      default:
        return 'ticket-status-pill';
    }
  }

  getStatusLabel(status: TicketStatus): string {
    switch (status) {
      case 'open':
        return 'باز';
      case 'pending':
        return 'در حال بررسی';
      case 'answered':
        return 'پاسخ داده شده';
      case 'closed':
        return 'بسته شده';
    }
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

  getPriorityClass(priority: TicketPriority): string {
    switch (priority) {
      case 'urgent':
        return 'priority-pill priority-urgent';
      case 'high':
        return 'priority-pill priority-high';
      case 'normal':
        return 'priority-pill priority-normal';
      case 'low':
        return 'priority-pill priority-low';
    }
  }}
