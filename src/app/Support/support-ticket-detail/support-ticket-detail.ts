// src/app/Support/support-ticket-detail/support-ticket-detail.ts

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Ticket,
  TicketMessage,
  TicketPriority,
  TicketStatus,
} from '../../Models/ticket.model';
import { SupportService } from '../../Sevices/support.service';

@Component({
  selector: 'app-support-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support-ticket-detail.html',
  styleUrl: './support-ticket-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportTicketDetail implements OnInit {
  // ---------- signals ----------
  readonly ticket = signal<Ticket | null>(null);
  readonly messages = signal<TicketMessage[]>([]);
  readonly messageText = signal('');

  readonly loadingTicket = signal(false);
  readonly loadingMessages = signal(false);
  readonly sending = signal(false);

  @ViewChild('scrollArea') scrollArea!: ElementRef<HTMLDivElement>;

  constructor(
    private supportService: SupportService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    // هر بار لیست پیام‌ها عوض شد → اسکرول بره پایین
    effect(() => {
      const _ = this.messages(); // فقط برای وابستگی
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.goBack();
      return;
    }

    const ticketId = Number(idParam);
    if (Number.isNaN(ticketId)) {
      this.goBack();
      return;
    }

    this.loadTicket(ticketId);
    this.loadMessages(ticketId);
  }

  // ========== API Calls ==========

  private loadTicket(id: number) {
    this.loadingTicket.set(true);

    this.supportService.getTicket(id).subscribe({
      next: (t) => {
        this.ticket.set(t);
        this.loadingTicket.set(false);
      },
      error: (err) => {
        console.error('خطا در دریافت تیکت', err);
        this.loadingTicket.set(false);
        this.goBack();
      },
    });
  }

  private loadMessages(ticketId: number) {
    this.loadingMessages.set(true);

    this.supportService.listMessages(ticketId).subscribe({
      next: (msgs) => {
        // 🔹 همه پیام‌های بک‌اند اینجا ست می‌شن → پیام اول هم دیده می‌شه
        this.messages.set(msgs);
        this.loadingMessages.set(false);
      },
      error: (err) => {
        console.error('خطا در دریافت پیام‌ها', err);
        this.loadingMessages.set(false);
      },
    });
  }

  // ========== Scroll helper ==========

  scrollToBottom() {
    if (!this.scrollArea) return;
    const el = this.scrollArea.nativeElement;
    el.scrollTop = el.scrollHeight;
  }

  // ========== textarea binding ==========

  onMessageChange(value: string) {
    this.messageText.set(value);
  }

  // ========== Send message ==========

  sendMessage() {
    const t = this.ticket();
    const body = this.messageText().trim();

    if (!t || !body || this.sending()) return;

    this.sending.set(true);

    this.supportService.addMessage(t.id, body).subscribe({
      next: (msg) => {
        // 🔹 اینجا بلافاصله پیام جدید به آرایه سیگنال اضافه می‌شه
        this.messages.update((prev) => [...prev, msg]);
        this.messageText.set('');
        this.sending.set(false);
      },
      error: (err) => {
        console.error('خطا در ارسال پیام', err);
        this.sending.set(false);
      },
    });
  }

  // ========== Close / reopen ticket ==========

  closeTicket() {
    const t = this.ticket();
    if (!t) return;

    this.supportService
      .updateTicket(t.id, { status: 'closed' })
      .subscribe({
        next: (updated) => {
          this.ticket.set(updated);
        },
        error: (err) => {
          console.error('خطا در بستن تیکت', err);
        },
      });
  }

  reopenTicket() {
    const t = this.ticket();
    if (!t) return;

    this.supportService
      .updateTicket(t.id, { status: 'open' })
      .subscribe({
        next: (updated) => {
          this.ticket.set(updated);
        },
        error: (err) => {
          console.error('خطا در باز کردن مجدد تیکت', err);
        },
      });
  }

  // ========== UI helpers (status / priority) ==========

  getStatusLabel(s: TicketStatus): string {
    return {
      open: 'باز',
      pending: 'در حال بررسی',
      answered: 'پاسخ داده شده',
      closed: 'بسته شده',
    }[s];
  }

  getStatusClass(s: TicketStatus): string {
    return {
      open: 'tag status-open',
      pending: 'tag status-pending',
      answered: 'tag status-answered',
      closed: 'tag status-closed',
    }[s];
  }

  getPriorityClass(p: TicketPriority): string {
    return {
      urgent: 'tag priority-urgent',
      high: 'tag priority-high',
      normal: 'tag priority-normal',
      low: 'tag priority-low',
    }[p];
  }

  getPriorityLabel(p: TicketPriority): string {
    return {
      urgent: 'فوری',
      high: 'زیاد',
      normal: 'معمولی',
      low: 'کم',
    }[p];
  }

  // ========== Back navigation ==========

  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/support/tickets']);
    }
  }
}
