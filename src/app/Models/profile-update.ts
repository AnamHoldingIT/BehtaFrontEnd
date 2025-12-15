export interface UpdateUserProfileRequest {
  email?: string;        // ایمیل اختیاری
  address?: string;      // آدرس اختیاری
  avatar?: string;       // URL جدید برای آواتار
  is_operator?: boolean; // به‌روزرسانی وضعیت نقش اپراتور
  contract_amount_toman?: number | null; // ✅ جدید

}
