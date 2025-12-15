import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { AdminEventLog } from '../../Models/admin-event-log.model';
import { AdminPanelService } from '../../Sevices/admin-panel.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './log.html',
  styleUrl: './log.css',
})
export class Log implements OnInit {
  private adminPanelService = inject(AdminPanelService);
  private destroyRef = inject(DestroyRef);

  // ---------- state با سیگنال ----------
  readonly logs = signal<AdminEventLog[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly levelFilter = signal<'all' | 'info' | 'warn' | 'error'>('all');
  readonly criticalOnly = signal(false);
  readonly searchTerm = signal('');

  readonly totalCount = signal(0);

  ngOnInit(): void {
    this.loadLogs();
  }

  // ---------- API call ----------
  loadLogs(): void {
    this.error.set(null);
    this.loading.set(true);

    const options: any = {};
    const level = this.levelFilter();
    const criticalOnly = this.criticalOnly();
    const search = this.searchTerm().trim();

    if (level !== 'all') {
      options.level = level;
    }
    if (criticalOnly) {
      options.critical = true;
    }
    if (search) {
      options.q = search;
    }

    this.adminPanelService
      .getLogs(options)
      .pipe(
        // برای clean شدن سابسکرایب بعد از destroy
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.logs.set(res.results);
          this.totalCount.set(res.count);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Admin logs API error:', err);
          this.error.set('در بارگذاری لاگ رویدادها خطایی رخ داد.');
          this.loading.set(false);
        },
      });
  }

  // ---------- handlers ----------
  onRefresh(): void {
    this.loadLogs();
  }

  toggleCritical(): void {
    this.criticalOnly.update((v) => !v);
    this.loadLogs();
  }

  cycleLevel(): void {
    const order: Array<'all' | 'info' | 'warn' | 'error'> = [
      'all',
      'info',
      'warn',
      'error',
    ];
    const currentIndex = order.indexOf(this.levelFilter());
    const nextIndex = (currentIndex + 1) % order.length;
    this.levelFilter.set(order[nextIndex]);
    this.loadLogs();
  }

  // ---------- helpers ----------
  getLevelClass(level: AdminEventLog['level']): string {
    switch (level) {
      case 'info':
        return 'pill-level pill-level-info';
      case 'warn':
        return 'pill-level pill-level-warn';
      case 'error':
        return 'pill-level pill-level-error';
      default:
        return 'pill-level';
    }
  }

  getLevelLabel(level: AdminEventLog['level']): string {
    switch (level) {
      case 'info':
        return 'Info';
      case 'warn':
        return 'Warn';
      case 'error':
        return 'Error';
    }
  }

  getUserIcon(log: AdminEventLog): string {
    if (log.user_display) return 'bi-person-badge';
    if (log.module) return 'bi-cpu';
    return 'bi-info-circle';
  }

  getUserLabel(log: AdminEventLog): string {
    if (log.user_display) return log.user_display;
    if (log.module) return `ماژول: ${log.module}`;
    return 'سیستم';
  }
}
