// src/app/Sevices/patchnotes.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  PatchNote,
  PaginatedResponse,
  UpdatePatchNoteItemPayload,
  PatchNoteItem,
  CreatePatchNoteItemPayload,
} from '../Models/patchnote.model';
import { AuthService } from './auth.service';


export type CreatePatchNotePayload = Omit<PatchNote, 'id' | 'items'>;


export type UpdatePatchNotePayload = Partial<Omit<PatchNote, 'id' | 'items'>>;

@Injectable({
  providedIn: 'root',
})
export class PatchNotesService {
  // 📌 پایه‌ی API
  private readonly publicBaseUrl = 'http://127.0.0.1:8000/api/patchnotes/patchnotes/';
  private readonly adminBaseUrl  = 'http://127.0.0.1:8000/api/patchnotes/admin/patchnotes/';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  // =============================
  // 🟣 Helpers
  // =============================


  private getAuthHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  // =============================
  // 🌐 Public APIs (Landing / Modal)
  // =============================

  /**
   * لیست PatchNoteهای منتشرشده (با pagination)
   * GET /api/patchnotes/patchnotes/
   *
   * @param options page, page_size, limit
   *  - اگر limit بدی، بک‌اند کوئری رو slice می‌کنه، ولی خروجی هنوز Paginated هست
   */
  listPublicPatchNotes(options?: {
    page?: number;
    page_size?: number;
    limit?: number;
  }): Observable<PaginatedResponse<PatchNote>> {
    let params = new HttpParams();

    if (options?.page) {
      params = params.set('page', options.page.toString());
    }
    if (options?.page_size) {
      params = params.set('page_size', options.page_size.toString());
    }
    if (options?.limit) {
      params = params.set('limit', options.limit.toString());
    }

    return this.http.get<PaginatedResponse<PatchNote>>(this.publicBaseUrl, {
      params,
    });
  }

  /**
   * نسخه‌ی ساده برای لندینگ:
   * فقط یه آرایه‌ی PatchNote (مثلاً برای مودال) برمی‌گردونه
   * در عمل: listPublicPatchNotes + map(results)
   */
  listPublicPatchNotesFlat(limit?: number): Observable<PatchNote[]> {
    return this.listPublicPatchNotes({ limit }).pipe(
      map((res) => res.results || []),
    );
  }

  /**
   * گرفتن یک PatchNote عمومی با id
   * GET /api/patchnotes/patchnotes/:id/
   */
  getPublicPatchNote(id: number): Observable<PatchNote> {
    return this.http.get<PatchNote>(`${this.publicBaseUrl}${id}/`);
  }

  /**
   * آخرین PatchNote منتشرشده
   * GET /api/patchnotes/patchnotes/latest/
   */
  getLatestPublicPatchNote(): Observable<PatchNote> {
    return this.http.get<PatchNote>(`${this.publicBaseUrl}latest/`);
  }

  // =============================
  // 🔐 Admin APIs (CRUD کامل)
  // =============================

  /**
   * لیست PatchNoteها برای پنل ادمین
   * GET /api/patchnotes/admin/patchnotes/
   */
  listAdminPatchNotes(options?: {
    page?: number;
    page_size?: number;
    // اگر بعداً در بک‌اند فیلتر اضافه کردی، اینجا هم اضافه کن (status, version, ...)
  }): Observable<PaginatedResponse<PatchNote>> {
    let params = new HttpParams();
    const headers = this.getAuthHeaders();

    if (options?.page) {
      params = params.set('page', options.page.toString());
    }
    if (options?.page_size) {
      params = params.set('page_size', options.page_size.toString());
    }

    return this.http.get<PaginatedResponse<PatchNote>>(this.adminBaseUrl, {
      headers,
      params,
    });
  }

  /**
   * جزئیات یک PatchNote در پنل ادمین
   * GET /api/patchnotes/admin/patchnotes/:id/
   */
  getAdminPatchNote(id: number): Observable<PatchNote> {
    const headers = this.getAuthHeaders();
    return this.http.get<PatchNote>(`${this.adminBaseUrl}${id}/`, {
      headers,
    });
  }

  /**
   * ساخت PatchNote جدید
   * POST /api/patchnotes/admin/patchnotes/
   */
  createPatchNote(payload: CreatePatchNotePayload): Observable<PatchNote> {
    const headers = this.getAuthHeaders();
    return this.http.post<PatchNote>(this.adminBaseUrl, payload, {
      headers,
    });
  }

  /**
   * آپدیت جزئی PatchNote
   * PATCH /api/patchnotes/admin/patchnotes/:id/
   */
  updatePatchNote(
    id: number,
    payload: UpdatePatchNotePayload,
  ): Observable<PatchNote> {
    const headers = this.getAuthHeaders();
    return this.http.patch<PatchNote>(
      `${this.adminBaseUrl}${id}/`,
      payload,
      { headers },
    );
  }

  /**
   * حذف PatchNote
   * DELETE /api/patchnotes/admin/patchnotes/:id/
   */
  deletePatchNote(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.adminBaseUrl}${id}/`, {
      headers,
    });
  }

  /**
   * مارک کردن یک PatchNote به عنوان آخرین نسخه (is_latest = true)
   * سیگنال بک‌اند بقیه نسخه‌ها رو خودش is_latest=False می‌کنه
   */
  markAsLatest(id: number): Observable<PatchNote> {
    return this.updatePatchNote(id, { is_latest: true });
  }


  private adminItemsUrl(patchnoteId: number): string {
    // مثال: http://127.0.0.1:8000/api/patchnotes/admin/patchnotes/1/items/
    return `${this.adminBaseUrl}${patchnoteId}/items/`;
  }

  /**
   * لیست آیتم‌های یک PatchNote در پنل ادمین
   * GET /api/patchnotes/admin/patchnotes/:patchnoteId/items/
   */
  listAdminPatchNoteItems(patchnoteId: number): Observable<PatchNoteItem[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<PatchNoteItem[]>(this.adminItemsUrl(patchnoteId), {
      headers,
    });
  }

  /**
   * ساخت آیتم جدید برای یک PatchNote
   * POST /api/patchnotes/admin/patchnotes/:patchnoteId/items/
   */
  createAdminPatchNoteItem(
    patchnoteId: number,
    payload: CreatePatchNoteItemPayload,
  ): Observable<PatchNoteItem> {
    const headers = this.getAuthHeaders();
    return this.http.post<PatchNoteItem>(
      this.adminItemsUrl(patchnoteId),
      payload,
      { headers },
    );
  }

  /**
   * آپدیت یک آیتم خاص
   * PATCH /api/patchnotes/admin/patchnotes/:patchnoteId/items/:itemId/
   */
  updateAdminPatchNoteItem(
    patchnoteId: number,
    itemId: number,
    payload: UpdatePatchNoteItemPayload,
  ): Observable<PatchNoteItem> {
    const headers = this.getAuthHeaders();
    return this.http.patch<PatchNoteItem>(
      `${this.adminItemsUrl(patchnoteId)}${itemId}/`,
      payload,
      { headers },
    );
  }

  /**
   * حذف آیتم
   * DELETE /api/patchnotes/admin/patchnotes/:patchnoteId/items/:itemId/
   */
  deleteAdminPatchNoteItem(
    patchnoteId: number,
    itemId: number,
  ): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(
      `${this.adminItemsUrl(patchnoteId)}${itemId}/`,
      { headers },
    );
  }
}
