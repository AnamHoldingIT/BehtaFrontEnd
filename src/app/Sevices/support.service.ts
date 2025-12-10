import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ApiTicket, ApiTicketMessage, NewTicketRequest, Ticket, TicketListItem, TicketPriority, TicketStats, TicketStatus } from '../Models/ticket.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupportService {
  // پایه‌ی API — اگر env داشتی می‌تونی از اون بخونی
  private readonly apiBase = 'http://127.0.0.1:8000/api/support/tickets/';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  // هدر Auth مثل بقیه سرویس‌هات
  private getAuthHeaders() {
    return this.authService.getAuthHeaders();
  }

  // ================== تیکت‌ها ==================

  /**
   * لیست تیکت‌ها (برای کاربر عادی فقط تیکت‌های خودش رو می‌ده)
   * می‌تونی بعداً تو بک‌اند فیلتر و سرچ اضافه کنی
   */
  listTickets(options?: {
    status?: TicketStatus | 'all';
    priority?: TicketPriority | 'all';
    search?: string;
    page?: number;
  }): Observable<TicketListItem[]> {
    let params = new HttpParams();
    const headers = this.getAuthHeaders();

    if (options?.status && options.status !== 'all') {
      params = params.set('status', options.status);
    }
    if (options?.priority && options.priority !== 'all') {
      params = params.set('priority', options.priority);
    }
    if (options?.search?.trim()) {
      params = params.set('search', options.search.trim());
    }
    if (options?.page) {
      params = params.set('page', options.page.toString());
    }

    // فرض: DRF یا لیست ساده می‌ده یا paginate
    return this.http
      .get<ApiTicket[] | { results: ApiTicket[] }>(this.apiBase, { headers, params })
      .pipe(
        map((res) => {
          const items = Array.isArray(res) ? res : res.results;
          return items.map((t): TicketListItem => ({
            id: t.id,
            subject: t.subject,
            status: t.status,
            priority: t.priority,
            updated_at: t.updated_at,
            category: t.category,
            messages_count: t.messages_count,
            last_message_at: t.last_message_at,
            has_unread: false, // اگر بعداً endpoint unread داشتی، اینجا ست کن
          }));
        }),
      );
  }

  /**
   * یک تیکت کامل
   */
  getTicket(id: number | string): Observable<Ticket> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiTicket>(`${this.apiBase}${id}/`, { headers });
  }

  /**
   * ساخت تیکت جدید (TicketCreateSerializer)
   */
  createTicket(payload: NewTicketRequest): Observable<Ticket> {
    const headers = this.getAuthHeaders();
    return this.http.post<ApiTicket>(this.apiBase, payload, { headers });
  }

  /**
   * آپدیت تیکت (مثلا برای ادمین‌ها یا اگر بعداً اجازه دادی)
   */
  updateTicket(
    id: number | string,
    data: Partial<Pick<ApiTicket, 'status' | 'priority' | 'category' | 'assigned_to'>>,
  ): Observable<Ticket> {
    const headers = this.getAuthHeaders();
    return this.http.patch<ApiTicket>(`${this.apiBase}${id}/`, data, { headers });
  }

  /**
   * حذف تیکت (فقط ادمین طبق بک‌اند)
   */
  deleteTicket(id: number | string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiBase}${id}/`, { headers });
  }

  // ================== پیام‌های داخل تیکت ==================

  /**
   * لیست پیام‌های یک تیکت
   * GET /tickets/:id/messages/
   */
  listMessages(ticketId: number | string): Observable<ApiTicketMessage[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiTicketMessage[]>(
      `${this.apiBase}${ticketId}/messages/`,
      { headers },
    );
  }

  /**
   * ارسال پیام جدید روی یک تیکت
   * POST /tickets/:id/messages/
   */
  addMessage(
    ticketId: number | string,
    body: string,
    options?: { is_internal?: boolean },
  ): Observable<ApiTicketMessage> {
    const headers = this.getAuthHeaders();

    const payload = {
      body,
      is_internal: options?.is_internal ?? false,
    };

    return this.http.post<ApiTicketMessage>(
      `${this.apiBase}${ticketId}/messages/`,
      payload,
      { headers },
    );
  }

  // ================== آمار تیکت‌ها (سمت فرانت) ==================

  /**
   * آمار وضعیت تیکت‌های کاربر
   * فعلاً از لیست تیکت‌ها محاسبه می‌کنیم
   * (اگر بعداً endpoint جدا برای stats دادی، اینو عوض می‌کنیم)
   */
  getTicketStats(): Observable<TicketStats> {
    return this.listTickets().pipe(
      map((tickets) => {
        const stats: TicketStats = {
          open: 0,
          pending: 0,
          answered: 0,
          closed: 0,
        };

        for (const t of tickets) {
          if (t.status === 'open') stats.open++;
          else if (t.status === 'pending') stats.pending++;
          else if (t.status === 'answered') stats.answered++;
          else if (t.status === 'closed') stats.closed++;
        }

        return stats;
      }),
    );
  }

  /**
 * ویرایش پیام ادمین روی یک تیکت
 * PATCH /tickets/:ticketId/messages/:messageId/
 */
  updateMessage(
    ticketId: number | string,
    messageId: number | string,
    body: string,
  ): Observable<ApiTicketMessage> {
    const headers = this.getAuthHeaders();
    return this.http.patch<ApiTicketMessage>(
      `${this.apiBase}${ticketId}/messages/${messageId}/`,
      { body },
      { headers },
    );
  }

  /**
   * حذف پیام ادمین روی یک تیکت
   * DELETE /tickets/:ticketId/messages/:messageId/
   */
  deleteMessage(
    ticketId: number | string,
    messageId: number | string,
  ): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(
      `${this.apiBase}${ticketId}/messages/${messageId}/`,
      { headers },
    );
  }

}
