import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConditionInvestigationNewTerminalService {
  private conversationId: string;

  private openModalSource = new Subject<void>();
  openModal$ = this.openModalSource.asObservable();

  private terminalDataSource = new Subject<any>();
  terminalData$ = this.terminalDataSource.asObservable();

  private conversationIdSource = new Subject<string>();
  conversationId$ = this.conversationIdSource.asObservable();

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
}
