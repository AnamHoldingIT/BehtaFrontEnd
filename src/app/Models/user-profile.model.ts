import { User } from "./user.model";

export interface UserProfile {
  id: number;                // شناسه پروفایل
  user: User;                // ارجاع به مدل User
  email: string | null;      // ایمیل
  address: string | null;    // آدرس
  avatar: string | null;     // مسیر تصویر پروفایل
  is_operator: boolean;      // نقش متصدی بودن
  contract_amount_toman: number | null;
  created_at: string;        // تاریخ ایجاد پروفایل
}