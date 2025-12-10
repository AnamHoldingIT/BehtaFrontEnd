import { UserProfile } from "./user-profile.model";

export interface User {
  id: number;                // شناسه کاربر
  phone: string;             // شماره تلفن
  first_name: string;        // نام
  last_name: string;         // نام خانوادگی
  role: 'super_admin' | 'admin' | 'normal';  // نقش کاربر
  is_active: boolean;        // وضعیت فعال بودن کاربر
  is_staff: boolean;         // وضعیت دسترسی به پنل ادمین
  created_at: string;        // تاریخ ایجاد حساب
  updated_at: string;        // تاریخ آخرین بروزرسانی

  profile?: UserProfile | null; 
}
