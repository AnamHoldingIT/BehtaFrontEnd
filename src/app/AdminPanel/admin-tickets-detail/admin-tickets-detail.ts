import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupportService } from '../../Sevices/support.service';
import { Ticket, TicketMessage, TicketPriority, TicketStatus } from '../../Models/ticket.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-tickets-detail',
  imports: [FormsModule , CommonModule],
  templateUrl: './admin-tickets-detail.html',
  styleUrl: './admin-tickets-detail.css',
})
export class AdminTicketsDetail implements OnInit {
    // inject
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supportService = inject(SupportService);
  private destroyRef = inject(DestroyRef);

  // state
  readonly ticket = signal<Ticket | null>(null);
  readonly messages = signal<TicketMessage[]>([]);

  readonly loadingTicket = signal(true);
  readonly ticketError = signal<string | null>(null);

  readonly loadingMessages = signal(true);
  readonly messagesError = signal<string | null>(null);

  readonly replyText = signal('');
  readonly sendingReply = signal(false);

  // --------- state مخصوص ادیت/حذف پیام ادمین ---------
  readonly editingMessageId = signal<number | null>(null);
  readonly editText = signal('');
  readonly savingEdit = signal(false);
  readonly deletingMessageId = signal<number | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id || Number.isNaN(id)) {
      this.ticketError.set('شناسه تیکت معتبر نیست.');
      this.loadingTicket.set(false);
      return;
    }

    this.loadTicket(id);
    this.loadMessages(id);
  }

  private loadTicket(id: number) {
    this.loadingTicket.set(true);
    this.ticketError.set(null);

    this.supportService
      .getTicket(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (t) => {
          this.ticket.set(t);
          this.loadingTicket.set(false);
        },
        error: (err) => {
          console.error('خطا در دریافت جزئیات تیکت', err);
          this.ticketError.set('دریافت جزئیات تیکت با خطا مواجه شد.');
          this.loadingTicket.set(false);
        },
      });
  }

  private loadMessages(id: number) {
    this.loadingMessages.set(true);
    this.messagesError.set(null);

    this.supportService
      .listMessages(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.messages.set(items);
          this.loadingMessages.set(false);
        },
        error: (err) => {
          console.error('خطا در دریافت پیام‌های تیکت', err);
          this.messagesError.set('دریافت پیام‌های تیکت با خطا مواجه شد.');
          this.loadingMessages.set(false);
        },
      });
  }

  // ---------- تغییر وضعیت / اولویت ----------

  onStatusChange(status: TicketStatus) {
    const current = this.ticket();
    if (!current || current.status === status) return;

    this.supportService
      .updateTicket(current.id, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.ticket.update((t) => (t ? { ...t, status } : t)),
        error: (err) => {
          console.error('خطا در تغییر وضعیت تیکت', err);
        },
      });
  }

  onPriorityChange(priority: TicketPriority) {
    const current = this.ticket();
    if (!current || current.priority === priority) return;

    this.supportService
      .updateTicket(current.id, { priority })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.ticket.update((t) => (t ? { ...t, priority } : t)),
        error: (err) => {
          console.error('خطا در تغییر اولویت تیکت', err);
        },
      });
  }

  // ---------- پاسخ ----------

  onReplyChange(value: string) {
    this.replyText.set(value);
  }

  clearReply() {
    this.replyText.set('');
  }

  handleReplyKeydown(ev: KeyboardEvent | Event) {
    const e = ev as KeyboardEvent;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendReply();
    }
  }

  sendReply() {
    const t = this.ticket();
    const body = this.replyText().trim();
    if (!t || !body || this.sendingReply()) return;

    this.sendingReply.set(true);

    this.supportService
      .addMessage(t.id, body, { is_internal: false })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (msg) => {
          // اضافه کردن پیام جدید به لیست
          this.messages.update((list) => [...list, msg]);

          // آپدیت فیلدهای زمان/تعداد در تیکت
          this.ticket.update((old) =>
            old
              ? {
                  ...old,
                  messages_count: old.messages_count + 1,
                  last_message_at: msg.created_at,
                }
              : old,
          );

          this.replyText.set('');
          this.sendingReply.set(false);
        },
        error: (err) => {
          console.error('خطا در ارسال پاسخ', err);
          this.sendingReply.set(false);
        },
      });
  }

  // ---------- ادیت پیام ادمین ----------

  startEditMessage(msg: TicketMessage) {
    // فقط روی پیام‌های ادمین اجازه بده
    if (!msg.is_from_staff) return;
    this.editingMessageId.set(msg.id);
    this.editText.set(msg.body);
  }

  cancelEditMessage() {
    this.editingMessageId.set(null);
    this.editText.set('');
    this.savingEdit.set(false);
  }

  saveEditMessage() {
    const t = this.ticket();
    const messageId = this.editingMessageId();
    const body = this.editText().trim();

    if (!t || !messageId || !body || this.savingEdit()) return;

    this.savingEdit.set(true);

    this.supportService
      .updateMessage(t.id, messageId, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.messages.update((list) =>
            list.map((m) => (m.id === updated.id ? updated : m)),
          );
          this.cancelEditMessage();
        },
        error: (err) => {
          console.error('خطا در ویرایش پیام', err);
          this.savingEdit.set(false);
        },
      });
  }

  // ---------- حذف پیام ادمین ----------

  deleteMessage(msg: TicketMessage) {
    const t = this.ticket();
    if (!t || !msg.is_from_staff) return;

    // اگر خواستی modal بسازی، این قسمت رو بعداً جایگزین کن
    const ok = window.confirm('آیا از حذف این پیام مطمئن هستید؟');
    if (!ok) return;

    this.deletingMessageId.set(msg.id);

    this.supportService
      .deleteMessage(t.id, msg.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messages.update((list) =>
            list.filter((m) => m.id !== msg.id),
          );

          // کاهش تعداد پیام در تیکت (برای نمایش سایدبار)
          this.ticket.update((old) =>
            old
              ? {
                  ...old,
                  messages_count: Math.max(0, old.messages_count - 1),
                }
              : old,
          );

          // اگر پیام در حال ادیت بود، ادیت را ببند
          if (this.editingMessageId() === msg.id) {
            this.cancelEditMessage();
          }

          this.deletingMessageId.set(null);
        },
        error: (err) => {
          console.error('خطا در حذف پیام', err);
          this.deletingMessageId.set(null);
        },
      });
  }

  // ---------- helperهای shared با لیست ----------

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
      urgent: 'adm-status-pill priority-urgent',
      high: 'adm-priority-pill priority-high',
      normal: 'adm-priority-pill priority-normal',
      low: 'adm-priority-pill priority-low',
    }[p];
  }

  goBack() {
    this.router.navigate(['/admin-panel/tickets']);
  }

}
