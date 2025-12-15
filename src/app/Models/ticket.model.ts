// src/app/Models/ticket.model.ts

// وضعیت تیکت مطابق Django
export type TicketStatus = 'open' | 'pending' | 'answered' | 'closed';

// اولویت تیکت مطابق Django
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

// آمار کلی تیکت‌ها
export interface TicketStats {
  open: number;
  pending: number;
  answered: number;
  closed: number;
}

// درخواست ساخت تیکت جدید => دقیقا مطابق TicketCreateSerializer
export interface NewTicketRequest {
  subject: string;
  priority: TicketPriority;   // 'low' | 'normal' | 'high' | 'urgent'
  category: string | null;    // مثلا "مالی" یا "ورود به حساب"
  body: string;               // متن پیام اولیه
}

/**
 * شکل تیکت که از API می‌گیریم (TicketSerializer)
 */
export interface ApiTicket {
  id: number;
  user: number;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;

  assigned_to: number | null;
  last_updated_by: number | null;
  last_message_at: string | null;
  messages_count: number;

  created_at: string;
  updated_at: string;
}

// برای راحتی، خود Ticket رو همون ApiTicket در نظر می‌گیریم
export type Ticket = ApiTicket;

/**
 * پیام‌های تیکت مطابق TicketMessageSerializer
 */
export interface ApiTicketMessage {
  id: number;
  ticket: number;
  sender_id: number;
  sender_name: string;
  body: string;
  is_from_staff: boolean;
  is_internal: boolean;
  created_at: string;
}

// اگر خواستی اسم عمومی‌تر داشته باشی:
export type TicketMessage = ApiTicketMessage;

/**
 * مدل لیست برای UI (لیست تیکت‌ها)
 * اسم‌ها رو شبیه بک‌اند نگه می‌داریم که کمترین map لازم باشه
 */
export interface TicketListItem {
  id: number;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  updated_at: string;
  category: string | null;

  messages_count: number;
  last_message_at: string | null;

  // چیزی که فقط فرانت استفاده می‌کنه (مثلا برا نقطه سبز unread تو UI)
  has_unread?: boolean;
}
