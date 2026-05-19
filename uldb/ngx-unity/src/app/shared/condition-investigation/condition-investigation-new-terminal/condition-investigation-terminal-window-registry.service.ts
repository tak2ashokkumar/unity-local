import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConditionInvestigationTerminalWindowRegistryService {
 constructor() { };
  private windows = new Map<string, Window>();
  register(tabId: string, win: Window) {
    this.windows.set(tabId, win);
  }
  focus(tabId: string): boolean {
    const existing = this.windows.get(tabId);
    if (existing && !existing.closed) {
      existing.focus();
      return true;
    }
    this.windows.delete(tabId);
    return false;
  }
}
