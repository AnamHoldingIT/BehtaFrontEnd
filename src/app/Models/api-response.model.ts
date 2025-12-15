export interface ApiResponse<T> {
  success: boolean;          // موفقیت یا شکست عملیات
  message: string;           // پیام پاسخ
  data: T;                   // داده‌های پاسخ
  timestamp: string;         // زمان پاسخ
}