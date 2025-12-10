import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NewTicketRequest, TicketPriority } from '../../Models/ticket.model';
import { SupportService } from '../../Sevices/support.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-support-new-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support-new-ticket.html',
  styleUrl: './support-new-ticket.css',
})
export class SupportNewTicket {
   form: NewTicketRequest = {
    subject: '',
    priority: 'normal',
    category: null,
    body: '',
  };

  submitting = false;
  success = false;
  serverError: string | null = null;

  categories: string[] = [
    'مالی',
    'ورود به حساب',
    'فنی / باگ',
    'اشتراک و بسته‌ها',
    'پیشنهاد و بازخورد',
  ];

  priorities: { value: TicketPriority; label: string }[] = [
    { value: 'urgent', label: 'فوری' },
    { value: 'high', label: 'بالا' },
    { value: 'normal', label: 'عادی' },
    { value: 'low', label: 'کم' },
  ];

  constructor(
    private supportService: SupportService,
    private router: Router,
  ) {}

  get isValid(): boolean {
    return (
      this.form.subject.trim().length >= 5 &&
      this.form.body.trim().length >= 10
    );
  }

  selectCategory(c: string) {
    this.form.category = this.form.category === c ? null : c;
  }

  isCategoryActive(c: string): boolean {
    return this.form.category === c;
  }

  selectPriority(p: TicketPriority) {
    this.form.priority = p;
  }

  isPriorityActive(p: TicketPriority): boolean {
    return this.form.priority === p;
  }

  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/support']);
    }
  }

  onSubmit(formRef: NgForm) {
    if (!this.isValid || this.submitting) return;

    this.submitting = true;
    this.success = false;
    this.serverError = null;

    this.supportService.createTicket(this.form).subscribe({
      next: (ticket) => {
        this.submitting = false;
        this.success = true;

        // فرم را ریست کن (ولی اولویت رو برگردون روی normal)
        this.form = {
          subject: '',
          priority: 'normal',
          category: null,
          body: '',
        };

        formRef.resetForm({
          priority: 'normal',
          category: null,
        });

        // اگر دوست داشتی بعد ثبت، بری روی صفحه جزئیات:
        // this.router.navigate(['/support/tickets', ticket.id]);
      },
      error: (err) => {
        console.error('خطا در ثبت تیکت', err);
        this.submitting = false;

        if (err.error?.detail) {
          this.serverError = err.error.detail;
        } else if (err.status === 400) {
          this.serverError = 'لطفاً فیلدها را بررسی کن. اطلاعات ارسال‌شده معتبر نیست.';
        } else {
          this.serverError = 'در ثبت تیکت خطایی رخ داد. لطفاً چند دقیقه بعد دوباره امتحان کن.';
        }
      },
    });
  }
}
