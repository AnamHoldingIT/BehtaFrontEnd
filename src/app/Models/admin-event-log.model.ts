// src/app/Models/admin-event-log.model.ts
export type AdminLogLevel = 'info' | 'warn' | 'error';

export interface AdminEventLog {
  id: number;
  level: AdminLogLevel;
  message: string;
  module: string | null;
  ip_address: string | null;
  user_display: string | null;
  extra: any;
  created_at: string;   // ISO datetime از DRF
}

// چون DRF صفحه‌بندی داره:
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
