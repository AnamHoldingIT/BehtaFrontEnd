export interface PatchNoteItem {
  id: number;                // از PatchNoteItemSerializer
  order: number;
  icon_type: 'check' | 'flash' | 'star' | 'info' | 'bug';
  text: string;
}

export interface PatchNote {
  id: number;                // AutoField در Django
  version: string;
  title: string;
  subtitle: string;
  description: string;

  status: 'new' | 'improvement' | 'bugfix' | 'announcement';

  date: string;              // فرمت: YYYY-MM-DD
  is_latest: boolean;

  // دقیقا مطابق serializer (read_only=True)
  items: PatchNoteItem[];
}


export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}


export type PatchNoteStatus = PatchNote['status'];
export type PatchNoteItemIconType = PatchNoteItem['icon_type'];

// payload برای ساخت آیتم جدید در ادمین
export interface CreatePatchNoteItemPayload {
  order: number;
  icon_type: PatchNoteItemIconType;
  text: string;
}

// payload برای آپدیت آیتم (همه فیلدها اختیاری)
export type UpdatePatchNoteItemPayload = Partial<CreatePatchNoteItemPayload>;