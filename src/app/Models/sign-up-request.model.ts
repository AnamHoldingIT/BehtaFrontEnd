export interface SignUpRequest {
  phone: string;             // شماره تلفن
  first_name: string;        // نام
  last_name: string;         // نام خانوادگی
  password: string;          // رمز عبور
  password2: string;         // تکرار رمز عبور
}