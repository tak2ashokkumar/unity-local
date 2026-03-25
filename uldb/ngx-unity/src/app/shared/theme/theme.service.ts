import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService, StorageType } from '../app-storage/storage.service';

export type UnityTheme = string;

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private _current$ = new BehaviorSubject<UnityTheme>(environment.theme.defaultTheme);

  /** Observable of the currently active theme name ('light' | 'dark' | …) */
  readonly currentTheme$ = this._current$.asObservable();

  constructor(private storage: StorageService) {}

  // ─── Getters used by template / profile page ──────────────────────────────

  get currentTheme(): UnityTheme {
    return this._current$.value;
  }

  get allowSwitch(): boolean {
    return environment.theme.allowSwitch;
  }

  get availableThemes(): string[] {
    return environment.theme.availableThemes;
  }

  // ─── Bootstrap (called from APP_INITIALIZER) ──────────────────────────────

  init(): void {
    const persisted = this.storage.getByKey(STORAGE_KEY, StorageType.LOCALSTORAGE) as string | null;
    const valid     = environment.theme.availableThemes;
    const resolved  = persisted && valid.includes(persisted) ? persisted : environment.theme.defaultTheme;
    this._applyToDOM(resolved);
    this._current$.next(resolved);
  }

  // ─── Runtime switch ───────────────────────────────────────────────────────

  setTheme(theme: UnityTheme): void {
    if (!environment.theme.availableThemes.includes(theme)) { return; }
    this.storage.put(STORAGE_KEY, theme, StorageType.LOCALSTORAGE);
    this._applyToDOM(theme);
    this._current$.next(theme);
  }

  isDark(): boolean {
    return this._current$.value === 'dark';
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private _applyToDOM(theme: UnityTheme): void {
    const body    = document.body;
    const prefix  = 'theme-';
    // Remove any existing theme-* class
    const existing = Array.from(body.classList).filter(c => c.startsWith(prefix));
    existing.forEach(c => body.classList.remove(c));
    body.classList.add(`${prefix}${theme}`);
  }
}
