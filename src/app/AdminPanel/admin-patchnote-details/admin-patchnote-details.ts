import {
  Component,
  OnInit,
  signal,
  WritableSignal,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { PatchNote, PatchNoteItem } from '../../Models/patchnote.model';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CreatePatchNotePayload,
  PatchNotesService,
  UpdatePatchNotePayload,
} from '../../Sevices/patchnotes.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-patchnote-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-patchnote-details.html',
  styleUrl: './admin-patchnote-details.css',
})
export class AdminPatchnoteDetails implements OnInit {
  form!: FormGroup;

  // ---- سیگنال‌های نسخه ----
  isCreateMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  saveMessage = signal<string | null>(null);

  patchNote: WritableSignal<PatchNote | null> = signal<PatchNote | null>(null);

  // ---- سیگنال‌های آیتم‌ها ----
  items = signal<PatchNoteItem[]>([]);
  itemsLoading = signal(true);
  itemsError = signal<string | null>(null);

  // فرم افزودن آیتم جدید
  newItemForm!: FormGroup;

  // فقط برای راحتی اگه خواستی تو تمپلیت استفاده کنی
  isEditMode = computed(() => !this.isCreateMode());

  // آیتم‌ها به ترتیب order
  orderedItems = computed(() =>
    [...this.items()].sort((a, b) => a.order - b.order || a.id - b.id),
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private patchNotesService: PatchNotesService,
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const createMode = idParam === 'new';
    this.isCreateMode.set(createMode);

    this.buildForm();

    if (!createMode && idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) {
        this.loadPatchNote(id);
      } else {
        this.error.set('شناسه نسخه نامعتبر است.');
      }
    }
  }

  private buildForm(): void {
    // فرم اصلی نسخه
    this.form = this.fb.group({
      version: ['', Validators.required],
      title: ['', Validators.required],
      subtitle: [''],
      description: [''],
      status: ['new', Validators.required],
      date: ['', Validators.required],
      is_latest: [false],
    });

    // فرم آیتم جدید
    this.newItemForm = this.fb.group({
      icon_type: ['check', Validators.required],
      text: ['', [Validators.required, Validators.maxLength(400)]],
    });
  }

  private loadPatchNote(id: number): void {
    this.isLoading.set(true);
    this.itemsLoading.set(true);
    this.error.set(null);
    this.itemsError.set(null);

    this.patchNotesService.getAdminPatchNote(id).subscribe({
      next: (note) => {
        this.patchNote.set(note);
        this.isLoading.set(false);

        this.form.patchValue({
          version: note.version,
          title: note.title,
          subtitle: note.subtitle,
          description: note.description,
          status: note.status,
          date: note.date,
          is_latest: note.is_latest,
        });

        // 🔴 اینجا فیکس اصلی:
        this.items.set(note.items ?? []);   // items از خود note می‌آید
        this.itemsLoading.set(false);
      },
      error: () => {
        this.error.set('خطا در دریافت اطلاعات نسخه.');
        this.isLoading.set(false);
        this.itemsLoading.set(false); // که UI قفل نماند
      },
    });
  }


  private loadItems(patchnoteId: number): void {
    this.itemsLoading.set(true);
    this.itemsError.set(null);

    this.patchNotesService.listAdminPatchNoteItems(patchnoteId).subscribe({
      next: (items) => {
        this.items.set(items);
        console.log(items);

        this.itemsLoading.set(false);
      },
      error: () => {
        this.itemsLoading.set(false);
        this.itemsError.set('خطا در دریافت آیتم‌های این نسخه.');
      },
    });
  }

  // -------- وضعیت / لیبل‌ها --------

  get statusOptions(): { value: PatchNote['status']; label: string }[] {
    return [
      { value: 'new', label: 'ویژگی جدید' },
      { value: 'improvement', label: 'بهبود' },
      { value: 'bugfix', label: 'رفع باگ' },
      { value: 'announcement', label: 'اعلان' },
    ];
  }

  statusLabel(status: PatchNote['status']): string {
    return this.statusOptions.find((s) => s.value === status)?.label || status;
  }

  statusPillClass(status: PatchNote['status']): string {
    switch (status) {
      case 'new':
        return 'status-pill status-new';
      case 'improvement':
        return 'status-pill status-improvement';
      case 'bugfix':
        return 'status-pill status-bugfix';
      case 'announcement':
        return 'status-pill status-announcement';
      default:
        return 'status-pill';
    }
  }

  iconClass(item: PatchNoteItem): string {
    if (item.icon_type === 'flash' || item.icon_type === 'bug') {
      return 'icon-circle icon-blue';
    }
    return 'icon-circle icon-gold';
  }

  iconName(item: PatchNoteItem): string {
    switch (item.icon_type) {
      case 'check':
        return 'bi bi-check-lg';
      case 'flash':
        return 'bi bi-lightning-charge-fill';
      case 'star':
        return 'bi bi-star-fill';
      case 'info':
        return 'bi bi-info-lg';
      case 'bug':
        return 'bi bi-bug-fill';
      default:
        return 'bi bi-dot';
    }
  }

  // -------- اکشن‌های نسخه --------

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);
    this.saveMessage.set(null);

    const payload = this.form.value as CreatePatchNotePayload;

    if (this.isCreateMode()) {
      // create
      this.patchNotesService.createPatchNote(payload).subscribe({
        next: (note) => {
          this.isSaving.set(false);
          this.saveMessage.set('نسخه جدید با موفقیت ایجاد شد.');
          this.router.navigate(['/admin-panel/patchnotes', note.id]);
        },
        error: () => {
          this.isSaving.set(false);
          this.error.set('خطا در ایجاد نسخه.');
        },
      });
    } else if (this.patchNote()) {
      // update
      const updatePayload: UpdatePatchNotePayload = payload;
      this.patchNotesService
        .updatePatchNote(this.patchNote()!.id, updatePayload)
        .subscribe({
          next: (note) => {
            this.patchNote.set(note);
            this.isSaving.set(false);
            this.saveMessage.set('تغییرات با موفقیت ذخیره شد.');
          },
          error: () => {
            this.isSaving.set(false);
            this.error.set('خطا در ذخیره تغییرات.');
          },
        });
    }
  }

  markAsLatest(): void {
    if (!this.patchNote() || this.isCreateMode()) return;

    this.isSaving.set(true);
    this.error.set(null);
    this.saveMessage.set(null);

    this.patchNotesService.markAsLatest(this.patchNote()!.id).subscribe({
      next: (note) => {
        this.patchNote.set(note);
        this.form.patchValue({ is_latest: note.is_latest });
        this.isSaving.set(false);
        this.saveMessage.set('این نسخه به عنوان آخرین نسخه علامت‌گذاری شد.');
      },
      error: () => {
        this.isSaving.set(false);
        this.error.set('خطا در علامت‌گذاری نسخه به عنوان آخرین.');
      },
    });
  }

  delete(): void {
    if (!this.patchNote() || this.isCreateMode()) return;

    const ok = confirm('آیا از حذف این نسخه مطمئن هستید؟');
    if (!ok) return;

    this.isSaving.set(true);
    this.error.set(null);

    this.patchNotesService.deletePatchNote(this.patchNote()!.id).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/admin-panel/patchnotes']);
      },
      error: () => {
        this.isSaving.set(false);
        this.error.set('خطا در حذف نسخه.');
      },
    });
  }

  backToList(): void {
    this.router.navigate(['/admin-panel/patchnotes']);
  }

  // -------- اکشن‌های آیتم‌ها --------

  addItem(): void {
    if (this.isCreateMode() || !this.patchNote()) {
      return;
    }

    if (this.newItemForm.invalid) {
      this.newItemForm.markAllAsTouched();
      return;
    }

    this.itemsLoading.set(true);
    this.itemsError.set(null);

    const current = this.items();
    const nextOrder =
      current.length > 0 ? Math.max(...current.map((i) => i.order)) + 1 : 1;

    const payload = {
      order: nextOrder,
      icon_type: this.newItemForm.value.icon_type,
      text: this.newItemForm.value.text,
    };

    this.patchNotesService
      .createAdminPatchNoteItem(this.patchNote()!.id, payload)
      .subscribe({
        next: (item) => {
          this.items.set([...this.items(), item]);
          this.newItemForm.reset({
            icon_type: 'check',
            text: '',
          });
          this.itemsLoading.set(false);
        },
        error: () => {
          this.itemsLoading.set(false);
          this.itemsError.set('خطا در افزودن آیتم جدید.');
        },
      });
  }

  deleteItem(item: PatchNoteItem): void {
    if (!this.patchNote()) return;

    const ok = confirm('آیا از حذف این آیتم مطمئن هستید؟');
    if (!ok) return;

    this.itemsLoading.set(true);
    this.itemsError.set(null);

    this.patchNotesService
      .deleteAdminPatchNoteItem(this.patchNote()!.id, item.id)
      .subscribe({
        next: () => {
          this.items.set(this.items().filter((i) => i.id !== item.id));
          this.itemsLoading.set(false);
        },
        error: () => {
          this.itemsLoading.set(false);
          this.itemsError.set('خطا در حذف آیتم.');
        },
      });
  }
}
