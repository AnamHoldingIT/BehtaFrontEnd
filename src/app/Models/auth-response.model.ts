import { User } from "./user.model";

export interface AuthResponse {
  token: string;             // توکن JWT
  user: User;                // اطلاعات کاربر
  role: string;              // نقش کاربر
  is_staff: boolean;         // آیا کاربر دسترسی ادمین دارد؟
  is_superuser: boolean;     // آیا کاربر سوپر ادمین است؟
}