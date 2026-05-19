import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConditionInvestigationNewTerminalService {
  private conversationId: string;
  private pendingTabType: 'sameTab' | 'newTab' = 'sameTab';
  private backendTabId: string | null = null;

  private openModalSource = new Subject<void>();
  openModal$ = this.openModalSource.asObservable();

  private terminalDataSource = new Subject<any>();
  terminalData$ = this.terminalDataSource.asObservable();

  private conversationIdSource = new Subject<string>();
  conversationId$ = this.conversationIdSource.asObservable();

  private backendTabIdSource = new BehaviorSubject<string | null>(null);
  backendTabId$ = this.backendTabIdSource.asObservable();

  constructor() { }

  openTerminal() {
    this.openModalSource.next();
  }

  openTerminalDirect(input: any, auth: any) {
    this.terminalDataSource.next({ input, auth });
  }

  setConversationId(id: string) {
    this.conversationId = id;
    this.conversationIdSource.next(id);
  }

  getConversationId(): string {
    return this.conversationId;
  }

  setPendingTabType(type: 'sameTab' | 'newTab') {
    this.pendingTabType = type;
  }

  getPendingTabType(): 'sameTab' | 'newTab' {
    return this.pendingTabType;
  }

  setBackendTabId(tabId: string | null) {
    this.backendTabId = tabId;
    this.backendTabIdSource.next(tabId); //emit to subscribers
  }

  getBackendTabId(): string | null {
    return this.backendTabId;
  }
}
